
document.addEventListener("DOMContentLoaded", sessionFetch);
document.addEventListener("usersLoad", messagesInit);
document.addEventListener("userSelected", userSelected);
document.addEventListener("addButtonTrigger", handleAddButton);
document.addEventListener("usersUpdate", updateUserList);
//document.addEventListener("chatSelected", messagesInit);
//global bool for mobile view
var isMobile = (self.innerWidth < 800);
//gloal bool for signed in user (would get from database in implementation
var currUsername;
var currUserId;
var loggedIn;
//for rendering messages
var messageRoot;
var currentMessages = [];
var allUserMessages = [];
//global roots
const userRoot = ReactDOM.createRoot(document.getElementById('UWRoot'));
const windowRoot = ReactDOM.createRoot(document.getElementById('windowRoot'));

const ULroot = ReactDOM.createRoot(document.getElementById('userList'));

import NavBar from "../navBarComponent/nav.js";
import MessageWindow from "./components/MessageWindow.js";
// import UserWindow from "./components/AddUserWindow.js";
import * as MW from "./components/MessageWindow.js";
import * as UL from "./userSelect.js";
import * as UW from "./components/AddUserWindow.js";


//connect to websocket
//const socket = new WebSocket("ws://localhost:8080");
// const socket = new WebSocket("wss://tutetitans.eastus.cloudapp.azure.com/ws")
// const socket2 = new WebSocket("tutetitans.eastus.cloudapp.azure.com");
// const socket3 = new WebSocket("wss://tutetitans.eastus.cloudapp.azure.com");
// const socket4 = new WebSocket("wss://tutetitans.eastus.cloudapp.azure.com/wss");
// const socket5 = new WebSocket("tutetitans.eastus.cloudapp.azure.com/wss");
// const socket = new WebSocket("ws://localhost:3000");
//websocket actions (listen for data from the server to update to messages if necessary)
// socket.addEventListener('open', (event) => {
//    console.log('Connected to WebSocket server');
// });



//fake websocket implementation for azure server - websockets will not co-operate on the azure server despite many hours of attempts

function newLoop(){
   checkForNewMessages();
   setTimeout(newLoop, 2000);
}


function checkForNewMessages(){
   //console.log("check for new ");
   //fetch messages and check if there is a new one
   fetch("/node/messages/" + currUserId + "").then(res => res.json()).then(res => {
      //filter messages for only those that match the targetuser
      if (res.length == allUserMessages.length){

      }
      //dont
      else {
         //allUserMessages = res;
         let newMessages = [];
         //get new messages
         for(let i=0;i<res.length;i++){
            var isNew = true;
            for(let j=0;j<allUserMessages.length;j++){
              
               let cMsg = allUserMessages[j];
               let isOld = ((cMsg.sender.id == res[i].sender.id) && (cMsg.target.id == res[i].target.id) && (cMsg.body == res[i].body));
               if(isOld){
                  isNew = false;
               }

            }
            if(isNew){
            newMessages.push(res[i]);
            }


         }
         //display new messages
         for(let i=0;i<newMessages.length;i++){
         

            let msgData = newMessages[i];
            if(msgData.sender.id == parseInt(document.querySelector(".selected").getAttribute("data-user"))){
               //messagesToDisplay.push(newMessages[i]);
               let newMessage = createMessage({"sender": {name: msgData.sender.name, id: msgData.sender.id}, "body": msgData.body});
               currentMessages.push(newMessage);
               //console.log("new", newMessages[i]);
               updateCurrentMessageDisplay();
            }
         }

      
      //console.log("new ", newMessages);

      allUserMessages = res;
   }
   });

   
}


// socket.addEventListener('message', (event) => {
//    console.log('Message from server:', event.data);
   
//    //after receiving message from the server, parse it and determine if the dom should be updated
//    //check if sender matches target user and target matches loggedin user
//    //check if valid message format
//    let msgData = JSON.parse(event.data);
//    console.log("data ", msgData);
//    if(msgData.sender != undefined ){
//       if(msgData.sender.id == parseInt(document.querySelector(".selected").getAttribute("data-user")) && msgData.target.id == currUserId){
//          //update current message display
//          console.log("update");
//          let newMessage = createMessage({"sender": {name: msgData.sender.name, id: msgData.sender.id}, "body": msgData.body});
//          currentMessages.push(newMessage);
//          updateCurrentMessageDisplay();
//       }
//       //if target matchers user then update messages stored
//       else if(msgData.target.id == currUserId){
//          updateUserList();
//       }

//    }
//  });



function sessionFetch(){
   fetch("/node/session").then(res => res.json()).then(res => {
      //console.log("sessionres", res);
      //if not logged in
      loggedIn = res.loggedIn;
      currUsername = res.user;
      currUserId = res.userID;
      

      init();
   })
}

async function init(){

   UL.usersInit(currUsername, currUserId, ULroot, allUserMessages);

   
   //initialize roots
   messageRoot = ReactDOM.createRoot(document.getElementById('messages'));
   //initialize navbar
   let navRoot = ReactDOM.createRoot(document.getElementById("nav-root"));
   navRoot.render(React.createElement(NavBar, {active: "Messages"}));

   if(isMobile){
      console.log("is mobile!");
      //for mobile views, we want to display user list and chat separately
      handleMobileDisplay();
      return;
   }   //if not logged in
   if(!loggedIn){
      document.getElementById("chatTitle").textContent = "Log In to start messaging.";
      return;
   }
   createAddUserList();

   //add listeners
   document.getElementById("sendMessage").addEventListener("click", handleSendMessage);
   document.getElementById("message-input").addEventListener("keypress", e => {
      if(e.key == "Enter"){
         e.preventDefault();
         document.getElementById("sendMessage").click();
      }
   });
   window.addEventListener("resize", handleWindowResize);
   
   //getMessages();
   newLoop();

}



function messagesInit(){
   //console.log("messages init");
   getMessages();
   //getMessages(document.querySelector("#userList").getAttribute("data-first"));
}


function createAddUserList(){
   //fetch friends here when friend endpoint is implemented
      fetch("/node/userFriends/").then(res => res.json()).then(res =>{
         let friends = res.friendsList,
         elms = [];
         //hard code friends for testing
         if(!friends){
            //friends = [{name: "colekrushel", userId: 8}, {name: "cole2", userId: 14}];
            friends = [];
         }
         
         //console.log("friends", friends);
         if(!friends)friends = [];
         for(let i=0;i<friends.length;i++){
            elms.push(React.createElement('div', {className: 'friendItem', key: friends[i].username}, 
               React.createElement('p', { className: 'friendName'}, friends[i].username),
               React.createElement('button', { className: 'friendButton', onClick: () => {windowRoot.render(React.createElement(MessageWindow, {target: friends[i].username, id: friends[i].userID}))}},  "Message")
            ))
         }
         //console.log("elms", elms);
         //handle no friends
         if(elms.length == 0){
            elms = React.createElement('h2', {className: 'friendName'}, 'Make new friends on our ', React.createElement('a', {className: 'a', href: "/node/Searching/index.html"}, 'search page!'));
         }
         userRoot.render(React.createElement(UW.UserWindow, {elms: elms}));
   });


   
}

function handleWindowResize(e){
   //check if screen is going mobile to non-mobile
   if(isMobile && self.innerWidth > 800){
      
      //adjust display
      isMobile = (self.innerWidth < 800);
      //make chat appear again
      document.querySelector("#chatDiv").style.display = "block";
      document.querySelector("#userList").style.display = "block";
      //remove mobile event handlers
      document.querySelectorAll("#userList figure").forEach(elm => {elm.removeEventListener("click", selectChatMobile)});
      //load messages from first user in list
      document.querySelector("#userList figure").classList.add("selected");
      getMessages();
      return;
   }
   //non mobile to mobile
   isMobile = (self.innerWidth < 800);
   if(isMobile){
      document.querySelector("#chatDiv").style.display = "none";
      handleMobileDisplay();
      return;
   }
}

function userSelected(e){
   if(isMobile){
      selectChatMobile();
   } else {
      getMessages();
   }
}

function getMessages(){

   
   //read target user from selected element
   //if no target user( no friends)
   let selectedUser = document.querySelector(".selected");
   if(!selectedUser){
      console.log("no friends :(");
      return;
   }
   let targetUser = selectedUser.getAttribute("data-user");
   
   //fetch messages from current user and return all that have a target of targetUser
  //only fetch messages the first time
  if(allUserMessages.length < 1){
   fetch("/node/messages/" + currUserId + "").then(res => res.json()).then(res => {
      //filter messages for only those that match the targetuser
      let messagesToDisplay = [];
      for(let i=0;i<res.length;i++){
         if(res[i].target.id == targetUser ||  res[i].sender.id == targetUser){
            messagesToDisplay.push(res[i]);
         }
      }
      allUserMessages = res;
      displayMessages(messagesToDisplay);
   })
  } else {
   let messagesToDisplay = [];
   let res = allUserMessages;
   for(let i=0;i<res.length;i++){
      if(res[i].target.id == targetUser ||  res[i].sender.id == targetUser){
         messagesToDisplay.push(res[i]);
      }
   }
   displayMessages(messagesToDisplay);
  }

}


function displayMessages(res){
   
   //render a react component for every message
   let messages = [];
   for(let i=0;i<res.length;i++){
      let tempMessage = createMessage(res[i], i)
      messages.push(tempMessage);
   }
   //update current messages array
   
   currentMessages = messages; 
   currentMessages.push(React.createElement('div', {className: "scrollDiv", key: "bottomDiv"}));
   messageRoot.render(React.createElement(MessageSection, {elms: currentMessages}));

   //update title
   let selectedUsername = document.querySelector(".selected").getAttribute("data-name");
   //let html = `<h1><a href="/user/${selectedUsername}>${selectedUsername}</a></h1>`;
   let html =`<h1><a target="_blank" href='/node/user/${selectedUsername}'>${selectedUsername}</a></h1>`;
   //fix
   document.getElementById("chatTitle").innerHTML = html;
   //document.getElementById("chatTitle").textContent = document.querySelector(".selected").getAttribute("data-name");
   

}

function createMessage(messageInfo, index){
   //determine whether message is You or notYou
   let isYou = "notYou", username = messageInfo.sender.name;
   if(username == currUsername) {
      isYou = "you";
      username = "You";
   }
   if(index == undefined){
      //create index based on amount of messages already present
      index = currentMessages.length;
   }
   return React.createElement(
      'div',
      {className: 'messageBox ' +  isYou, key: "div" + index},
      
      React.createElement(
        'h2', 
        {key: "h2" + index, className: "username averia-text"},
        username
      ),
      
      React.createElement(
        'p',
        {key: "p" + index, className: "fustat-text"},
        messageInfo.body
      ),
    );
}


function handleSendMessage(e){
   //put message info into a urlsearchparams and then send to api
   let form = new URLSearchParams(); 
   let content = document.getElementById("message-input").value;
   form.append("loggedInUsername", currUsername); //change to read from session
   form.append("loggedInUserId", currUserId); //change to read from session
   form.append("targetUsername", document.querySelector(".selected").getAttribute("data-name"));
   form.append("targetUserId", document.querySelector(".selected").getAttribute("data-user"));
   form.append("messageContent", content);
   fetch("/node/messages/send", {
      method: "POST",
      body: form
   }).then(res => {
      //add message to display and re-render
      let newMessage = createMessage({"sender": {name: currUsername, id: currUserId}, "body": content});
      currentMessages.push(newMessage);
      updateCurrentMessageDisplay();

   })
}

function updateCurrentMessageDisplay(){
   //currentMessages.push(message);
   //react will only render the new message if i unmount the component first...
   messageRoot.render(React.createElement(MessageSection, {elms: currentMessages}));
   //scroll to bottom

   //clear message window
   document.getElementById("message-input").value = "";
   
}

function updateUserList(){
   //reload allmessage variable
   fetch("/node/messages/" + currUserId + "").then(res => res.json()).then(res => {
      //filter messages for only those that match the targetuser
      allUserMessages = res;
      UL.usersInit(currUsername, currUserId, ULroot, allUserMessages);
   })
   
}



function handleMobileDisplay(){
   console.log("handle mobile display");
   //unique handling for mobile messaging views;
   //clicking on a username will change the chat view to display their messages and the send button
   //put a back button somewhere
   document.getElementById("sendMessage").addEventListener("click", handleSendMessage);
   document.getElementById("backButton").addEventListener("click", handleChatBackButton);
}

function selectChatMobile(e){
   //let selectedName = e.currentTarget.firstChild.textContent;
   getMessages();
   //change view to only display messages
   document.querySelector("#chatDiv").style.display = "block";
   document.querySelector("#userList").style.display = "none";
}

function handleChatBackButton(e){
   //change view to display users
   document.querySelector("#chatDiv").style.display = "none";
   document.querySelector("#userList").style.display = "block";
}

function handleAddButton(){
   //display add popup?
   UW.openWindow();
}

function scrollToBottomMessages(){
   let targetElm = document.querySelector("#messages div:last-of-type");
   targetElm.scrollIntoView();
}

//////REACT ELEMENT TO HOLD MESSAGES
function MessageSection(props){
   React.useEffect( () => {
      scrollToBottomMessages();
   });

   return React.createElement('h3', {className: 'MStitle'}, ""),
   props.elms

}