require('dotenv').config({ path: '/home/tutetitans/.env' });
const MONGODBConnect = process.env.MONGODB;

const express = require('express');

const WebSocket = require('ws') //websockets
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path')
const { ObjectId } = require('mongodb');
const https = require('https');


const app = express()
const port = 3000

const session = require("express-session");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid'); // For generating unique secretIDs

//MongoDB Connection Stuff
async function getFriendsList(userId) {
 
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();

        const db = client.db("TuteTitansDb");
        const collection = db.collection("friends");
        const query = { userId: userId };
        const documents = await collection.find(query).toArray();

        const count = await collection.countDocuments();
        if (count > 1) {
            throw ("ERROR, CANNOT HAVE MULTIPLE FRIENDS WITH SAME 'userId'");
        }

        if (documents[0].friendsList.length === 0) {
            console.log("No friends :(");
        } else {
            console.log(`Yes friends :)`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function addFriend(friendToAdd, sessionId) {
    const client = new MongoClient(MONGODBConnect);
  
    try {
       await client.connect();
       const db = client.db("TuteTitansDb");
       const collection = db.collection("info");
       
       // Add the friend to the current user's friends list
       const result = await collection.updateOne(
          { userID: sessionId },
          { $addToSet: { friends: friendToAdd } }
       );
       
       // Add the current user to the friend's friends list (reciprocal)
       // First get the current user's username
       const currentUser = await collection.findOne({ userID: sessionId });
       if (!currentUser) {
           throw new Error("Current user not found");
       }
       
       // Then add it to the friend's friends list
       const reciprocalResult = await collection.updateOne(
          { username: friendToAdd },
          { $addToSet: { friends: currentUser.username } }
       );
       
       console.log("DA result Add", result);
       console.log("DA result Reciprocal Add", reciprocalResult);
       return { result, reciprocalResult }; 
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        await client.close();
    }
 }
 
 async function deleteFromRequests(friendToDelete, sessionId) {
     const client = new MongoClient(MONGODBConnect);
   
     try {
        await client.connect();
   
        const db = client.db("TuteTitansDb");
        const collection = db.collection("info");
        
        // Fixed: use userID instead of userId
        const result = await collection.updateOne(
           { userID: sessionId },
           { $pull: { friend_requests: friendToDelete } }
        );
        console.log("DA result DELETE", result);
        return result;
     } catch (e) {
        console.error(e);
        throw e; // Re-throw to handle in the calling function
     } finally {
        await client.close();
     }
 }

// connect to user DB 
async function getUsersCollection() {
    const client = new MongoClient(MONGODBConnect);
    await client.connect();
    const db = client.db("TuteTitansDb");
    return { client, collection: db.collection("users") };
}

async function getNextUserID(db) {
    const collection = db.collection("info");
    const highestUser = await collection.find().sort({ userID: -1 }).limit(1).toArray();
    return highestUser.length ? highestUser[0].userID + 1 : 1; // Start from 1 if empty
}

async function getUserFromSession(req) {
    if (!req.session || !req.session.user || !req.session.user.secretID) {
        throw new Error("User is not authenticated or session is missing.");
    }

    const secretID = req.session.user.secretID;
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");
        const collection = db.collection("info");

        const user = await collection.findOne({ secretID: secretID });
        return user;
    } catch (error) {
        console.error("Error fetching user info from session:", error);
        throw error;
    } finally {
        await client.close();
    }
}

//public
app.use(express.static('Public'))
app.use('/user/Profile', express.static(path.join(__dirname, 'Public/Profile')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// sets up session
app.use(bodyParser.json());
app.use(
    cors({
        origin: "http://localhost:3000", // Adjust based on your frontend URL
        credentials: true,
    })
);

app.use(
    session({
        secret: "3a15d74e3ff3a945d6b65758db33a0a17b14f0df5d1c731c7b8df04219a5f8e4", // Change this to a strong secret
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true }, // Set secure to true if using HTTPS
    })
);


app.get('/userFriends', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/node/login");
    }

    const userId = parseInt(req.session.user.userID);
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");

        const collection = db.collection("info");

        const user = await collection.findOne({ userID: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found in friends database" });
        }


        const friendsUsernames = user.friends; 
        const friendsInfo = await collection.find({
            username: { $in: friendsUsernames }
        }).toArray();
        return res.json({ friendsList: friendsInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        await client.close();
    }
});

app.get('/userHome/viewEvent/:eventId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/node/login");
    }

    const userId = parseInt(req.session.user.userID);
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");

        const infoCollection = db.collection("info");
        const usersCollection = db.collection("users");

        const eventObjectId = new ObjectId(req.params.eventId);

        // First, find the user's matched events
        const infoDoc = await infoCollection.findOne({
            userID: userId,
            events_matched: eventObjectId // ensures the event is in the list
        });

        if (!infoDoc) {
            return res.status(404).json({ error: "Event not found in user's matched list" });
        }

        // Then, fetch the event details from the users collection
        const eventData = await usersCollection.findOne({ _id: eventObjectId });

        if (!eventData) {
            return res.status(404).json({ error: "Event details not found" });
        }

        res.json({ event: eventData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    } finally {
        await client.close();
    }
});

app.get('/userHome/viewEventAny/:eventId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/node/login");
    }

    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");

        const infoCollection = db.collection("info");
        const usersCollection = db.collection("users");

        const eventObjectId = new ObjectId(req.params.eventId);

        // Then, fetch the event details from the users collection
        const eventData = await usersCollection.findOne({ _id: eventObjectId });

        if (!eventData) {
            return res.status(404).json({ error: "Event details not found" });
        }

        res.json({ event: eventData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    } finally {
        await client.close();
    }
});


app.get('/userFriendRequests', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/node/login");
    }

    const userId = parseInt(req.session.user.userID);
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");
        const collection = db.collection("info");

        const user = await collection.findOne({ userID: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found in friends database" });
        }

        const friendsUsernames = user.friend_requests; 
        const friendsInfo = await collection.find({
            username: { $in: friendsUsernames }
        }).toArray();
        return res.json({ friendsList: friendsInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        await client.close();
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "Public/index.html"));
})


// create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//read in json data
var messageData = JSON.parse(fs.readFileSync('./Public/Messaging/testData.json', 'utf8'));

app.listen(port, () => {
    console.log('Listening on *:3000')
})

///websockets
// const SSLCertPath = "/etc/ssl/certs/ssl-cert-snakeoil.pem"
// const SSLKeyPath = "/etc/ssl/private/ssl-cert-snakeoil.key"

// const server = https.createServer({
//     key: fs.readFileSync(SSLKeyPath),
//     cert: fs.readFileSync(SSLCertPath)
// });

const wss = new WebSocket.Server({ port: 8080 });
//const wss = new WebSocket.Server({ port: 443});

//proxy attempt

// HTTP/HTTPS proxy to connect to
// var proxy = process.env.http_proxy || 'https://tutetitans.eastus.cloudapp.azure.com:3128';
// console.log('using proxy server %j', proxy);

// // WebSocket endpoint for the proxy to connect to
// var endpoint = process.argv[2] || 'ws://echo.websocket.org';
// var parsed = url.parse(endpoint);
// console.log('attempting to connect to WebSocket %j', endpoint);

// // create an instance of the `HttpsProxyAgent` class with the proxy server information
// var options = url.parse(proxy);

// var agent = new HttpsProxyAgent(options);

// // finally, initiate the WebSocket connection
// var socket = new WebSocket(endpoint, { agent: agent });

// socket.on('open', function () {
//     console.log('"open" event!');
//     socket.send('hello world');
//   });


// const wss = new WebSocket.Server({
//     server,
//     verifyClient: (info, cb) => {
//       const origin = info.origin;
//       // Validate origin here
//       cb(true);
//     }
//   });


// let p = 3000
// wss.listen(p, () => {
//     console.log("listening on " + p)
// } )
// server.listen(3000, () => {
//     console.log('WebSocket server started on ' + 3000);
// });

//const wss = new WebSocket.WebSocketServer({ port: 8080 });

//const wss = new WebSocket.Server({port: 8080});

wss.on('connection', ws => {
  console.log('Client connected');
  //ws.send("hi client");
  //send any message received by the server to every client
  ws.on('message', function message(data, isBinary) {
   wss.clients.forEach(function each(client) {
     if (client.readyState === WebSocket.OPEN) {
       client.send(data, { binary: isBinary });
     }
   });
  });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});








app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "Public/index.html"))
})

app.get('/user/:username', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "Public/user.html"));
    } else {
        return res.redirect("/node/login");
    }
})

app.get('/commonSkills', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/node/login");
    }
    
    const userId = req.session.user.userID;
    const client = new MongoClient(MONGODBConnect);
    
    try {
        await client.connect();
        const db = client.db("TuteTitansDb");
        const collection = db.collection("info");
        const collection2 = db.collection("users");
        // Get the current user's profile
        const currentUser = await collection.findOne({ userID: userId });
        
        if (!currentUser || !currentUser.skills || currentUser.skills.length === 0) {
            console.log("No skills found for user");
            return res.status(404).json({ error: "No skills found for user" });
        }
        
        const skillToMatch = currentUser.skills[0];
        console.log(skillToMatch);  
        
        const usersWithCommonSkill = await collection2.find({
            userID: { $ne: userId }, 
            skill: skillToMatch
        }).limit(5).toArray();
        console.log(usersWithCommonSkill);
        res.json(usersWithCommonSkill);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    } finally {
        await client.close();
    }
});

app.delete('/matchedEvents/deleteEvent/:id', async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/node/login");
    }
  
    const userId = req.session.user.userID;
    const eventIdToDelete = new ObjectId(req.params.id);
    const client = new MongoClient(MONGODBConnect);
  
    try {
      await client.connect();
      const db = client.db("TuteTitansDb");
      const infoCollection = db.collection("info");
      
  
      const result = await infoCollection.updateOne(
        { userID: userId },
        { $pull: { events_matched: eventIdToDelete } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Event not found or already removed" });
      }
  
      res.json({ message: "Matched event deleted successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    } finally {
      await client.close();
    }
});

app.delete('/removeFriendRequest/:friend', async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/node/login");
    }
  
    const userId = req.session.user.userID;
    const friendRequestToDelete = req.params.friend;
    const client = new MongoClient(MONGODBConnect);

    try {
      await client.connect();
      const db = client.db("TuteTitansDb");
      const infoCollection = db.collection("info");
  
      const result = await infoCollection.updateOne(
        { userID: userId },
        { $pull: { friend_requests: friendRequestToDelete } }
      );
      console.log("HERE yo", result);
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Friend request not found or already removed" });
      }
  
      res.json({ message: "Friend request deleted successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    } finally {
      await client.close();
    }
});

app.delete('/createdEvents/deleteEvent/:id', async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/node/login");
    }
  
    const userId = req.session.user.userID;
    const eventIdToDelete = new ObjectId(req.params.id);
    const client = new MongoClient(MONGODBConnect);
  
    try {
      await client.connect();
      const db = client.db("TuteTitansDb");
      const infoCollection = db.collection("info");
      const usersCollection = db.collection("users");
      
      const result = await infoCollection.updateOne(
        { userID: userId },
        { $pull: { events_created: eventIdToDelete } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Event not found or already removed" });
      }

      const deleteResult = await usersCollection.deleteOne({ _id: eventIdToDelete });

      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: "Event not found or already removed" });
      }
  
      res.json({ message: "Created event deleted successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    } finally {
      await client.close();
    }
});

app.post('/addFriend/:friendToAdd', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/node/login");
        }
        
        const userId = req.session.user.userID;
        console.log("DA ID", userId);
        
        // Both operations - add friend and delete from requests
        await addFriend(req.params.friendToAdd, userId);  
        await deleteFromRequests(req.params.friendToAdd, userId);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to process friend request" });
    } 
});
  
app.post('/userEvents/add', async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/node/login");
    }
  
    const userId = req.session.user.userID;
    const { skill, description, event } = req.body;
  
    const client = new MongoClient(MONGODBConnect);
  
    try {
      await client.connect();
      const db = client.db("TuteTitansDb");
      const eventsCollection = db.collection("users");
      const infoCollection = db.collection("info");
  
      const newEvent = {
        userId,
        name: req.session.user.username || "Unnamed User",
        skill,
        description,
        event
      };
  
      const insertResult = await eventsCollection.insertOne(newEvent);
      const eventId = insertResult.insertedId;
  
      await infoCollection.updateOne(
        { userID: userId },
        { $addToSet: { events_created: eventId } } 
      );
  
      res.status(200).json({ message: "Event created successfully", eventId });
  
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to create event" });
    } finally {
      await client.close();
    }
  });
  

app.get('/userEvents/created', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/node/login");
    }

    const userId = req.session.user.userID;
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");
        const eventsCollection = db.collection("users");

        const userEvents = await eventsCollection.find({ userId: userId }).toArray();

        res.status(200).json(userEvents);
    } catch (error) {
        console.error("Error fetching user events:", error);
        res.status(500).json({ error: "Failed to fetch user-created events" });
    } finally {
        await client.close();
    }
});


app.get('/matchedEvents', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const userId = req.session.user.userID;
    const client = new MongoClient(MONGODBConnect);

    try {
    await client.connect();
    const db = client.db("TuteTitansDb");
    const infoCollection = db.collection("info");
    const eventsCollection = db.collection("users"); 

    // Get the current user's matched events
    const userProfile = await infoCollection.findOne({ userID: userId });
    if (!userProfile || !userProfile.events_matched || userProfile.events_matched.length === 0) {
        return res.status(404).json({ error: "No matched events found" });
    }

    const matchedEventIds = userProfile.events_matched;
    // console.log("matchedEventIds", matchedEventIds);
    const matchedEvents = await eventsCollection.find({
        _id: { $in: matchedEventIds }
    }).toArray();
    console.log("matchedEvents", matchedEvents);
    res.json(matchedEvents);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    } finally {
        await client.close();
    }
});
  
app.get('/userdata/:username', (req, res) => {
   if (req.session.user) {
      const client = new MongoClient(MONGODBConnect);
      client.connect().then(() => {
         console.log("mongo connected")
         const db = client.db("TuteTitansDb");
         const collection = db.collection("info");
         collection.findOne({username: req.params.username})
         .then(data => {
            client.close(); 
            if (data) {
                delete data._id
                delete data.secretID
                delete data.messages 
                delete data.events_created 
                delete data.events_matched 
                delete data.is_admin
               data.logged_in_user = (req.params.username === req.session.user.username) ? true : false;
               console.log(data);
               res.status(200).json(data);
            } else {
               res.status(404).json({"error": "User not found"});
            }
         });
      });
   } else {
      return res.redirect("/node/login");
   }
});

app.put('/userdata/:username', (req, res) => {
   if (req.session.user) {
      const profile_name = req.body.name;
      const profile_location = req.body.location;
      const profile_picture = req.body.picture;
      const profile_status = req.body.status;
      const profile_bio = req.body.bio;

      const client = new MongoClient(MONGODBConnect);
      client.connect().then(() => {
         console.log("mongo connected")
         const db = client.db("TuteTitansDb");
         const collection = db.collection("info");
         collection.updateOne({username: req.params.username}, { $set: { profile_name, profile_location, profile_picture, profile_status, profile_bio } })
         .then(data => {
            client.close(); 
            if (data.matchedCount > 0) {
               res.status(200).json(data);
            } else {
               res.status(404).json({"error": "User not found"});
            }
         });
      });
   } else {
      return res.redirect("/node/login");
   }
});

app.get('/profile', (req, res) => {
   if (req.session.user) {
      return res.redirect("/node/user/" + req.session.user.username);
   } else {
      return res.redirect("/node/login");
   }
});

app.get('/profile/edit', (req, res) => {
    console.log("hello you arrived at the correct endpoint")
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/node/Profile/edit.html"));
     } else {
        return res.redirect("/node/login");
     }
});

app.put('/skills/:username', (req, res) => {
    if (req.session.user) {
        const the_username = req.params.username;
        const skill_to_add = req.body.skillname;
        const client = new MongoClient(MONGODBConnect);
        client.connect().then(() => {
        console.log("mongo connected")
        const db = client.db("TuteTitansDb");
        const collection = db.collection("info");
        collection.updateOne({username: the_username}, {$addToSet: {skills: skill_to_add}})
        .then(data => {
            client.close(); 
            if (data) {
                res.status(200).json({skills: data.skills});
            } else {
                res.status(404).json({"error": "Error fetching skill list"});
            }
        });
        });
    } else {
        return res.redirect("/node/login");
    }
});

app.delete('/skills/:username', (req, res) => {
    if (req.session.user) {
        const the_username = req.params.username;
        const skill_to_remove = req.body.skillname;
        const client = new MongoClient(MONGODBConnect);
        client.connect().then(() => {
        console.log("mongo connected")
        const db = client.db("TuteTitansDb");
        const collection = db.collection("info");
        collection.updateOne({username: the_username}, {$pull: {skills: skill_to_remove}})
        .then(data => {
            client.close(); 
            if (data) {
                res.status(200).json({"message": "Successfully deleted user skill"});
            } else {
                res.status(404).json({"error": "Error fetching skill list"});
            }
        });
        });
    } else {
        return res.redirect("/node/login");
    }
});

app.get('/userdata/:username', (req, res) => {
    if (req.session.user) {
       const client = new MongoClient(MONGODBConnect);
       client.connect().then(() => {
          console.log("mongo connected")
          const db = client.db("TuteTitansDb");
          const collection = db.collection("info");
          collection.findOne({username: req.params.username})
          .then(data => {
             client.close(); 
             if (data) {
                 delete data._id
                 delete data.secretID
                 delete data.messages 
                 delete data.events_created 
                 delete data.events_matched 
                 delete data.is_admin
                data.logged_in_user = (req.params.username === req.session.user.username) ? true : false;
                res.status(200).json(data);
             } else {
                res.status(404).json({"error": "User not found"});
             }
          });
       });
    } else {
       return res.redirect("/node/login");
    }
 });

app.get('/skills', (req, res) => {
    const client = new MongoClient(MONGODBConnect);
    client.connect().then(() => {
        console.log("mongo connected")
        const db = client.db("TuteTitansDb");
        const collection = db.collection("skills");
        collection.findOne({ skillset: true })
            .then(data => {
                client.close();
                if (data) {
                    res.status(200).json(data.skills);
                } else {
                    res.status(404).json({ "error": "Error fetching skill list" });
                }
            });
    });
});

app.post('/friends/requests', (req, res) => {
    if (req.session.user) {
        const client = new MongoClient(MONGODBConnect);
        client.connect().then(() => {
            console.log("mongo connected")
            const db = client.db("TuteTitansDb");
            const collection = db.collection("info");
            var requested = req.body.requested_user;
            console.log(req.session.user.username + " wants to friend " + requested);
            collection.updateOne({ username: requested }, { $addToSet: { friend_requests: req.session.user.username } })
                .then(data => {
                    client.close();
                    if (data) {
                        res.status(200).json({ success: true });
                    } else {
                        res.status(404).json({ "error": "Error friending requested user" });
                    }
                });
        });
    } else {
        return res.redirect("/node/login");
    }
});

app.delete('/friends/:username', (req, res) => {
    if (req.session.user) {
        const client = new MongoClient(MONGODBConnect);
        client.connect().then(() => {
            console.log("mongo connected")
            const db = client.db("TuteTitansDb");
            const collection = db.collection("info");
            var requested = req.params.username;
            console.log(req.session.user.username + " wants to unfriend " + requested);
            collection.updateOne({ username: requested }, { $pull: { friends: req.session.user.username } })
                .then(data => {
                    collection.updateOne({ username: req.session.user.username }, { $pull: { friends: requested } })
                        .then(data2 => {
                            client.close();
                            if (data && data2) {
                                res.status(200).json({ success: true });
                            } else {
                                res.status(404).json({ "error": "Error unfriending requested user" });
                            }
                        });
                });
        });
    } else {
        return res.redirect("/node/login");
    }
});

app.get('/search/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public/Searching/index.html'));
});

app.get('/api/users', async (req, res) => {
    let client;
    try {
        client = new MongoClient(MONGODBConnect);
        await client.connect();

        const db = client.db("TuteTitansDb");

        const infoUsers = await db.collection("info").find({}).toArray();

        const eventIds = infoUsers.flatMap(user => user.events_created || []);
        const objectIds = eventIds.map(id => {
            try {
                return new ObjectId(id.toString());
            } catch {
                return null;
            }
        }).filter(id => id !== null);

        const eventDocs = await db.collection("users")
            .find({ _id: { $in: objectIds } })
            .toArray();

        const eventMap = {};
            eventDocs.forEach(event => {
                eventMap[event._id.toString()] = event.event || "Unnamed Event";
        });
        
        const formattedUsers = infoUsers.map(user => {
            const resolvedEvents = Array.isArray(user.events_created) && user.events_created.length > 0
                ? user.events_created.map(id => {
                    const strId = id.toString();
                    return eventMap[strId] || "Unknown Event";
                })
                : ["None"];        

            return {
                username: user.username,
                name: user.profile_name,
                skills: user.skills || [],
                description: user.profile_bio || "",
                events_created: resolvedEvents,
                raw_event_ids: (user.events_created || []).map(id => id.toString()),
                events_matched: user.events_matched || []
            };
        });

        if (req.query.q) {
            const query = req.query.q.toLowerCase();

            const filtered = formattedUsers.filter(user => {
                const skillMatch = Array.isArray(user.skills)
                    ? user.skills.some(skill => skill.toLowerCase().includes(query))
                    : false;

                const eventMatch = user.events_created.some(ev =>
                    ev.toLowerCase().includes(query)
                );

                return (
                    user.name?.toLowerCase().includes(query) ||
                    user.description?.toLowerCase().includes(query) ||
                    skillMatch ||
                    eventMatch
                );
            });

            res.json(filtered);
        } else {
            res.json(formattedUsers);
        }
    } catch (err) {
        console.error("Error fetching info users:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    } finally {
        if (client) client.close();
    }
});

app.post('/addMatchedEvent', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { eventId } = req.body;

    let objectId;
    try {
        objectId = new ObjectId(eventId);
    } catch {
        return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    const client = new MongoClient(MONGODBConnect);
    try {
        await client.connect();
        const db = client.db("TuteTitansDb");

        const result = await db.collection("info").updateOne(
            { userID: req.session.user.userID },
            { $addToSet: { events_matched: objectId } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Event matched successfully" });
        } else {
            res.status(404).json({ error: "User not found or event already matched" });
        }
    } catch (err) {
        console.error("Error matching event:", err);
        res.status(500).json({ error: "Server error" });
    } finally {
        await client.close();
    }
});

//messaging endpoints
app.get('/messages', (req, res) => {
    //return a list of uhhhhh umm
    res.send("messages");
})


app.get('/messages/:userid', async (req, res) => {
   //return all messages associated with the user
   messagesToReturn = [];
   const client = new MongoClient(MONGODBConnect);
 
   try {
      await client.connect();
      const db = client.db("TuteTitansDb");
      const collection = db.collection("info");
      //set up query
      const query = {userID: parseInt(req.params.userid)};
      const userInfo = await collection.findOne(query);
      //parse and send data returned
      if(!userInfo.messages){
        res.json({});
      }
      messagesToReturn = userInfo.messages
      res.json(messagesToReturn);
 
   } catch (e) {
       console.error(e);
   } finally {
       await client.close();
   }
   
   
})

app.post('/messages/send', urlencodedParser, async (req,res) => {
   //read message details from body
   var newMessage = {"sender": {"name": req.body.loggedInUsername, "id": parseInt(req.body.loggedInUserId)}, "target": {"name": req.body.targetUsername, "id": parseInt(req.body.targetUserId)}, "body": req.body.messageContent, "date": new Date()};
   //messageData.messages.push(newMessage);
   //update mongo

   const client = new MongoClient(MONGODBConnect);
 
   try {
      await client.connect();
 
      const db = client.db("TuteTitansDb");
      const collection = db.collection("info");
      //put into messages attribute of sender and target
 
      const senderResult = await collection.updateOne(
         { userID: parseInt(req.body.loggedInUserId)},
         { $push: {messages : newMessage} }
      );

      const targetResult = await collection.updateOne(
         { userID: parseInt(req.body.targetUserId)},
         { $push: {messages : newMessage} }
      );
   } catch (e) {
       console.error(e);
   } finally {
       await client.close();
   }


   //create a websocket client to send the message
   //const ws = new WebSocket('wss://https//tutetitans.eastus.cloudapp.azure.com');
   // Send a message once the connection is established
//    ws.on('open', () => {
      
//       // Send a message to the server from this external client
//       ws.send(JSON.stringify(newMessage));
//    });
   res.send("message sent");
})


// Signup Route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");

        const verifyCollection = db.collection("verify");
        const infoCollection = db.collection("info");

        // Check if the username is already taken
        const existingUser = await verifyCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const secretID = uuidv4(); // Generate unique secretID
        const userID = await getNextUserID(db); // Get next available userID

        // Insert into "verify"
        await verifyCollection.insertOne({
            username,
            password: hashedPassword,
            secretID,
            userID
        });

        // Insert into "info"
        await infoCollection.insertOne({
            secretID,
            username,
            userID,
            profile_name: "Skquid User",
            profile_location: "Atlantis",
            profile_status: "Making big waves, stay tuned 🌊",
            profile_bio: "Testing the waters. Just survived a tornado in a teacup and now I'm looking for the storm. A bear tried to steal my hat and I think the trees just had a meeting without me, but you already know I'm still going strong on Skquid.",
            profile_picture: "../resources/squid" + (Math.floor(Math.random() * 6) + 1) + ".png",
            skills: [],
            friends: [],
            friend_requests: [],
            messages: [],
            events_created: [],
            events_matched: [],
            is_admin: false
        });

        req.session.user = { username, secretID, userID }; // Store session
        res.json({ message: "User registered successfully", username });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await client.close();
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const client = new MongoClient(MONGODBConnect);

    try {
        await client.connect();
        const db = client.db("TuteTitansDb");
        const verifyCollection = db.collection("verify");

        // Find user in verify collection
        const user = await verifyCollection.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        req.session.user = { username, secretID: user.secretID, userID: user.userID }; // Store session
        res.json({ message: "Login successful", username });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await client.close();
    }
});

// Logout Route
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logout successful" });
    });
});

// Check Session Route
app.get("/session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user.username, userID: req.session.user.userID });
    } else {
        res.json({ loggedIn: false });
    }
})