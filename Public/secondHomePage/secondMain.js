'use strict';
import NavBar from '../navBarComponent/nav.js';

function leftCol({ isLeft }){
  return React.createElement(
    'div',
    {
      className: "leftSide"
    },
    React.createElement(
      'div',
      {
        className: "leftContent"
      },
      React.createElement(
        'div',
        {
          className: "leftContentTitle"
        },
        React.createElement(
          'h1',
          {
            id: "titleText", className: "averia-text"
          },
          isLeft ? "How does Skquid work?" : "What is Skquid"
        ),
        React.createElement(aboutSection)
      ),
      React.createElement(
        'div',
        {id: "commonInterestsDiv"},
       
        React.createElement(
          'div',
          {id: "listingInterestDiv"},
          React.createElement(getCommonEvents)
        )
      ),
      React.createElement(
        'h1',
        {id: "addEventTitle"},
        "Create an Event Today"
      ),
      React.createElement(createEventForm),
      React.createElement(getCreatedEvents)
    )
  );
}

function createEventForm() {
  return React.createElement(
    'form',
    {
      id: "createEventForm",
      onSubmit: async (e) => {
        e.preventDefault();
        const data = {
          skill: e.target.skill.value,
          description: e.target.description.value,
          event: e.target.event.value,
        };
      
        try {
          const response = await fetch('/node/userEvents/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
      
          const result = await response.json();
          if (response.ok) {
            displayNotif("eventcreate-notif", null);
            console.log("New Event ID:", result.eventId);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            alert("Failed to create event: " + result.error);
          }
        } catch (err) {
          console.error("Submission error:", err);
          alert("Server error. Please try again later.");
        }
      },
      className: "formContainer"
    },

    React.createElement('div', { className: "formGroup" },
      React.createElement('label', { htmlFor: 'skill' }, 'Skill'),
      React.createElement('input', {
        type: 'text',
        id: 'skill',
        name: 'skill',
        required: true,
        className: "formInput"
      })
    ),

    React.createElement('div', { className: "formGroup" },
      React.createElement('label', { htmlFor: 'description' }, 'Description'),
      React.createElement('textarea', {
        id: 'description',
        name: 'description',
        rows: 3,
        required: true,
        className: "formInput"
      })
    ),

    React.createElement('div', { className: "formGroup" },
      React.createElement('label', { htmlFor: 'event' }, 'Event'),
      React.createElement('input', {
        type: 'text',
        id: 'event',
        name: 'event',
        required: true,
        className: "formInput"
      })
    ),

    React.createElement('button', {
      type: 'submit',
      className: "submitBtn"
    }, 'Submit')
  );
}

function getCommonEvents(){
  const [results, setResults] = React.useState([]);
  const [matches, setMatches] = React.useState([]);
  
  React.useEffect(() => {
    console.log("Fetching matched events...");
    fetch("/node/matchedEvents")
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          console.log("Matched Events:", data);
          setMatches(data);
        } else {
          console.log("No matched events found, fetching common skills...");
          setMatches([]);
          return fetch("/node/commonSkills")
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              console.log("Common Skills:", data);  
              setResults(data);
              return data;
            });
        }
      })
      .catch(error => {
        console.error("Error fetching matched events or common skills:", error);
      });
  }, []);

  if (matches.length > 0) {
    return  React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        {id: "commonInterestsTitle"},
        "Your Matches"
      ),
      React.createElement(
        'div',
        {
          id: "listCommonInterests"
        },
        matches.map((result, index) =>   
          React.createElement(matchesCard, {
            name: result.name,
            skill: result.skill,
            description: result.description,
            key: index,
            eventId: result._id
          })
        )
      )
    )
  }
  console.log(results);
  if(results !== undefined && results.length != 0){
    return  React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        {id: "commonInterestsTitle"},
        "Events based on your interests"
      ),
      React.createElement(
        'div',
        {
          id: "listCommonInterests"
        },
        results.map((result, index) =>   
          React.createElement(skillsCard, {
            name: result.name,
            skill: result.skill,
            description: result.description,
            key: index
          })
        )
      )
    )
  } else {
    return  React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        {id: "commonInterestsTitle"},
        "Events based on your interests"
      ),
      React.createElement(
        'div',
        {
          id: "listCommonInterests"
        },
        React.createElement(
          'h1',
          {
            id: "noEventsText"
          },
        "No events related to your skills!"
        )
      )
    )
   
  }
}

function getCreatedEvents(){
  const [results, setResults] = React.useState([]);
  
  
  React.useEffect(() => {
    fetch('/node/userEvents/created')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user-created events');
      }
      return response.json();
    })
    .then(events => {
      console.log("User's created events:", events);
      setResults(events);
    })
    .catch(error => {
      console.error("Error fetching user events:", error);
    });
  }, []);

  if(results !== undefined && results.length != 0){
    return  React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        {id: "commonInterestsTitle"},
        "Events you created"
      ),
      React.createElement(
        'div',
        {
          id: "listCommonInterests"
        },
        results.map((result, index) =>   
          React.createElement(createdCard, {
            name: result.name,
            skill: result.skill,
            description: result.description,
            key: index,
            eventId: result._id
          })
        )
      )
    )
  } else {
    return  React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        {id: "commonInterestsTitle"},
        "Events you created"
      ),
      React.createElement(
        'div',
        {
          id: "listCommonInterests"
        },
        React.createElement(
          'h1',
          {
            id: "noEventsText"
          },
        "Create Events to See Them Here!"
        )
      )
    )
  }
}

function friendCard({ name, pfp }) {
  const redirectFunc = () => {
    console.log(name);
    window.location.href = window.location.origin + "/node/user/" + name;
  }

  const messageFriend = () => {
    window.location.href = window.location.origin + "/node/Messaging/index.html"; 
  }
  return React.createElement(
    'div',
    {
      className: "friendCard"
    },
    React.createElement(
      'img',
      {
        src: pfp,
        alt: `${name}'s profile picture`,
        className: "friendPfp",
        onClick: redirectFunc
      }
    ),
    React.createElement(
      'div',
      {
        className: "friendName averia-text"
      },
      name
    ),
    React.createElement(
      'a',
      {
        className: "chatBubble",
        onClick: messageFriend
      },
      React.createElement(
        'i',
        {
          className: "bi bi-chat-fill"
        }
      )
    )
  );
}

function friendRequestCard({ name, pfp }) {
  const addFriend = () => {
    fetch(`/node/addFriend/${name}`, {
      method: 'POST'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Server returned error status");
        }
        return response.json(); // will error if response is not JSON
      })
      .then(data => {
        displayNotif("friendaccept-notif", "You and " + name + " are now friends!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return data;
      })
      .catch(error => console.error('Error loading friends:', error));
  };

  const removeRequest = () => {  
    fetch(`/node/removeFriendRequest/${name}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Server returned error status");
        }
        return response.json(); 
      })
      .then(data => {
        displayNotif("friendreject-notif", "Rejected " + name + "'s request.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return data;
      })
      .catch(error => console.error('Error loading friends:', error));
  }
  const redirectFunc = () => {
    console.log(name);
    window.location.href = `${window.location.origin}/node/user/${name}`;
  };

  return React.createElement(
    'div',
    { className: "friendCard" },
    React.createElement(
      'img',
      {
        src: pfp,
        alt: `${name}'s profile picture`,
        className: "friendPfp",
        onClick: redirectFunc
      }
    ),
    React.createElement(
      'div',
      { className: "friendName averia-text" },
      name
    ),
    React.createElement(
      'div',
      {className: "addRmvFriend"},
      React.createElement(
        'a',
        { className: "friendOption", onClick: removeRequest },
        React.createElement(
          'i', 
          { 
            className: "bi-x-lg", 
          }
        )
      ),
      React.createElement(
        'a',
        { className: "friendOption", onClick: addFriend },
        React.createElement(
          'i', 
          { 
            className: "bi-check2", 
          }
        )
      )
    )
  );
}

function skillsCard({ name, skill, desription }) {

  return React.createElement(
    'div',
    {
      className: "skillsCard"
    },
    React.createElement(
      'h3',
      {
        className: "eventDisplaySHP averia-text"
      },
      name + ":"
    ),
    React.createElement(
      'p',
      {
        className: "fustat-text"
      },
      skill
    ),
    React.createElement(
      'p',
      {
        className: "fustat-text"
      },
      desription
    ),
    React.createElement(
      "button",
      {
        className: "eventAddButton averia-text",
        type: "button", 
        onClick: function() {
          window.location.href = window.location.origin + `/node/user/${name}`; 
        }
      },
      "Visit profile"
    ),
  );
}

function matchesCard({ name, skill, desription, eventId }) {
  const [eventData, setEventData] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  
  function displayEvent() {
    fetch(`/node/userHome/viewEvent/${eventId}`, {
      method: 'GET',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Event data:", data.event);
        setEventData(data);
        setIsOpen(true);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  const modal = isOpen && React.createElement(
    'div',
    { className: 'modalDiv' },
    React.createElement(
      'div',
      { className: 'modalContent' },
      React.createElement('h2', null, eventData.event.name),
      React.createElement('p', null, React.createElement('strong', null, "Skills: "), eventData.event.skill),
      React.createElement('p', null, React.createElement('strong', null, "Description: "), eventData.event.description),
      React.createElement('p', null, React.createElement('strong', null, "Events: "), eventData.event.event),
      React.createElement(
        'button',
        {
          className: 'modal-close-button',
          onClick: () => setIsOpen(false),
        },
        'Close'
      )
    )
  );
  

  return React.createElement(
    'div',
    { className: "skillsCard" },

    React.createElement('div', null,
      React.createElement('h3', { className: "eventDisplaySHP averia-text" }, name + ":"),
      React.createElement('p', { className: "fustat-text" }, skill),
      React.createElement('p', { className: "fustat-text" }, desription)
    ),

    React.createElement('div', { className: "buttonContainer" },
      React.createElement(
        "button",
        {
          className: "eventAddButton averia-text",
          type: "button",
          onClick: () => displayEvent()
        },
        "View Event"
      ),
      React.createElement(
        "button",
        {
          className: "eventAddButton averia-text",
          type: "button",
          onClick: async () => {
            try {
              console.log("Deleting event with ID:", eventId);
              const response = await fetch(`/node/matchedEvents/deleteEvent/${eventId}`, {
                method: "DELETE",
                credentials: "include"
              });

              if (response.ok) {
                displayNotif("eventdelete-notif", null);
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              } else {
                const err = await response.json();
                alert("Failed to delete event: " + err.error);
              }
            } catch (error) {
              console.error("Error deleting event:", error);
              alert("An unexpected error occurred.");
            }
          }
        },
        "Delete Event"
      )
    ),

    modal
  );
}

function createdCard({ name, skill, desription, eventId }) {
  const [eventData, setEventData] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  function displayEvent() {
    console.log("eventId", eventId);
    fetch(`/node/userHome/viewEventAny/${eventId}`, {
      method: 'GET',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Event data:", data.event);
        setEventData(data);
        setIsOpen(true);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  const modal = isOpen && React.createElement(
    'div',
    { className: 'modalDiv' },
    React.createElement(
      'div',
      { className: 'modalContent' },
      React.createElement('h2', null, eventData.event.name),
      React.createElement('p', null, React.createElement('strong', null, "Skills: "), eventData.event.skill),
      React.createElement('p', null, React.createElement('strong', null, "Description: "), eventData.event.description),
      React.createElement('p', null, React.createElement('strong', null, "Events: "), eventData.event.event),
      React.createElement(
        'button',
        {
          className: 'modal-close-button',
          onClick: () => setIsOpen(false),
        },
        'Close'
      )
    )
  );

  return React.createElement(
    'div',
    { className: "skillsCard" },

    React.createElement('div', null,
      React.createElement('h3', { className: "eventDisplaySHP averia-text" }, name + ":"),
      React.createElement('p', { className: "fustat-text" }, skill),
      React.createElement('p', { className: "fustat-text" }, desription)
    ),

    React.createElement('div', { className: "buttonContainer" },
      React.createElement(
        "button",
        {
          className: "eventAddButton averia-text",
          type: "button",
          onClick: () => displayEvent()
        },
        "View Event"
      ),
      React.createElement(
        "button",
        {
          className: "eventAddButton averia-text",
          type: "button",
          onClick: async () => {
            try {
              console.log("Deleting event with ID:", eventId);
              const response = await fetch(`/node/createdEvents/deleteEvent/${eventId}`, {
                method: "DELETE",
                credentials: "include"
              });

              if (response.ok) {
                displayNotif("eventdelete-notif", null);
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              } else {
                const err = await response.json();
                alert("Failed to delete event: " + err.error);
              }
            } catch (error) {
              console.error("Error deleting event:", error);
              alert("An unexpected error occurred.");
            }
          }
        },
        "Delete Event"
      ),
      modal
    )
  );
}

function friendCol() {
  const [friends, setFriends] = React.useState([]);
  const [friendRequests, setFriendRequests] = React.useState([]);

  React.useEffect(() => {
    fetch(`/node/userFriends`)
      .then(response => {
        if (!response.ok) {
          console.log("user has no friends :(");
        }
        return response.json();
      })
      .then(data => setFriends(data.friendsList)) 
      .catch(error => console.error('Error loading friends:', error));

    fetch(`/node/userFriendRequests`)
    .then(response => {
      if (!response.ok) {
        console.log("user has no friends :(");
      }
      return response.json();
    })
    .then(data => setFriendRequests(data.friendsList)) 
    .catch(error => console.error('Error loading friends:', error));
      
  }, []);

  if(friends !== undefined && friends.length != 0){
    return React.createElement(
      'div',
      {
        className: "rightSide"
      },
      React.createElement(
        'h1',
        {
          id: "friendTitle", className: "averia-text"
        },
        "Your Friends"
      ),
      React.createElement(
        'div',
        {
          className: "rightContent"
        },
        friends.map(friend =>   
          React.createElement(friendCard, {
            name: friend.username,
            pfp: friend.profile_picture,
            key: friend.userID
          })
        )
      ),
      React.createElement(
        'h1',
        {
          id: "friendTitle", className: "averia-text"
        },
        "Friend Requests"
      ),
      React.createElement(
        'div',
        {
          className: "rightContent2"
        },
        friendRequests.map(friend =>   
          React.createElement(friendRequestCard, {
            name: friend.username,
            pfp: friend.profile_picture,
            key: friend.userID
          })
        )
      )
    );
  } else {
    return React.createElement(
      'div',
      {
        className: "rightSide"
      },
      React.createElement(
        'h1',
        {
          id: "friendTitle", className: "averia-text"
        },
        "Add Friends!"
      ),
      React.createElement(
        'div',
        {
          className: "rightContent"
        },
        React.createElement(
          'h2',
          {
            id: "noFriendsText"
          },
          "Search and add for friends to see them here!"
        )
      ),
      React.createElement(
        'h1',
        {
          id: "friendTitle", className: "averia-text"
        },
        "Friend Requests"
      ),
      React.createElement(
        'div',
        {
          className: "rightContent2"
        },
        friendRequests.map(friend =>   
          React.createElement(friendRequestCard, {
            name: friend.username,
            pfp: friend.profile_picture,
            key: friend.userID
          })
        )
      )
    );
  }
}

var changeAbout = false;

function aboutSection() {
  const [position, setPos] = React.useState(false);

  const toggleSlide = () => {
    changeAbout = !changeAbout;
    setPos(!position);
  };

  return React.createElement(
    'div',
    { className: 'logoSlider' },
    React.createElement(
      'img',
      {
        className: `movingImage ${position ? 'onLeft' : ''}`,
        src: "../resources/Skquid.png",
        onClick: toggleSlide
      }
    ),
    React.createElement(belowaboutSection)
  );
}

function belowaboutSection(){
  if (changeAbout){
    return React.createElement(
      'div',
      { className: 'varyContent averia-text' },
      "To learn a new skill, look through our Serach page in order to connect with someone who is teaching the skill you want to learn!"
    );
  } else {
    return React.createElement(
      'div',
      { className: 'varyContent averia-text' },
      "Skquid is a platform meant to bring down bariers caused by money, and allow our users to use their skills as currency!"
    );
  }
}

function App() {
  const [isLeft, setIsLeft] = React.useState(false);

  React.useEffect(() => {
    const handleImageClick = () => {
      setIsLeft(!isLeft);
    };

    const image = document.querySelector('.movingImage');
    if (image) {
      image.addEventListener('click', handleImageClick);
    }

    return () => {
      if (image) {
        image.removeEventListener('click', handleImageClick);
      }
    };
  }, [isLeft]);

  return React.createElement(
    'div',
    null,
    React.createElement(NavBar, {active: "Home"}),
    React.createElement(
      "div",
      {
        className: "flexBox"
      },
      React.createElement(leftCol, { isLeft }),
      React.createElement(friendCol),
      React.createElement('div', {className: 'banner-notif', id: 'friendaccept-notif'}, 
        React.createElement('i', {className: 'notif-icon bi bi-check-circle'}),
        React.createElement('p', {className: 'notif-text'}, "")),
      React.createElement('div', {className: 'banner-notif', id: 'friendreject-notif'}, 
        React.createElement('i', {className: 'notif-icon bi bi-dash-circle'}),
        React.createElement('p', {className: 'notif-text'}, "")),
      React.createElement('div', {className: 'banner-notif', id: 'eventcreate-notif'}, 
        React.createElement('i', {className: 'notif-icon bi bi-cal bi-calendar-check-fill'}),
        React.createElement('p', {className: 'notif-text'}, "Successfully created event!")),
      React.createElement('div', {className: 'banner-notif', id: 'eventdelete-notif'}, 
        React.createElement('i', {className: 'notif-icon bi bi-cal bi-calendar-x-fill'}),
        React.createElement('p', {className: 'notif-text'}, "Successfully deleted event!")),
    )
  );
}

const rootNode = document.getElementById('main-root');
const root = ReactDOM.createRoot(rootNode);
root.render(React.createElement(App));

function displayNotif(type, extra_arg) {
  var tag = document.getElementById(type);
  var original_inner = tag.innerHTML;
  if (extra_arg && !tag.innerHTML.includes(extra_arg)) {
    tag.innerHTML += extra_arg;
  }
  tag.style.display = "flex";

  tag.classList.remove("notif-animation");
  void tag.offsetWidth;
  tag.classList.add("notif-animation");

  setTimeout(() => {
    tag.style.display = "none";
    tag.innerHTML = original_inner;
  }, 1500);
}