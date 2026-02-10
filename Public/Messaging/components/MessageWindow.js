'use strict';

/*********************READ THIS BEFORE IMPORTING************************************
IMPORT COMPONENT AS TWO LINES
import MessageWindow from "./MessageWindow.js";
import * as MW from "./MessageWindow.js";

CREATE COMPONENT LIKE
let windowRoot = ReactDOM.createRoot(document.getElementById('windowRoot')); //windowRoot is a new div in the body
windowRoot.render(React.createElement(MessageWindow, {target: "Joe"})); //target should be obtained dynamically from your page
MW.openWindow(); //should be called whenever you want to display the message popup

the first line is for the component, the second line is for the associated method 
call functions like MW.openWindow() - make sure to render the window before you need to call this (it renders display none by default)
react doesn't like 'MW.MessageWindow' so you have to pass in MessageWindow into createElement

make sure to pass in the unique username of the target user when you create the element


*/

function MessageWindow(props) {

  var MWcurrUsername = "";
  var MWcurrUserId = "";

  // call this to close the popup
  function closeWindow() {
    //document.querySelector(".messageWindow").style.display = "none";
    document.getElementById("windowRoot").style.display = "none";
  }

  React.useEffect( () => {
    fetch("/node/session").then(res => res.json()).then(res => {
      MWcurrUsername = res.user;
      MWcurrUserId = res.userID;
      openWindow();
   })
    
    
   })
  

  function sendMessage(){
    //read message info
      //put message info into a urlsearchparams and then send to api
      let form = new URLSearchParams(); 
      let MWtargetUser = document.querySelector(".MWtargetUser").getAttribute("data-name"),
      MWtargetUserId = document.querySelector(".MWtargetUser").getAttribute("data-id"),
      content = document.querySelector(".MWinput").value;
      form.append("loggedInUsername", MWcurrUsername); //change to read from session
      form.append("loggedInUserId", MWcurrUserId); //change to read from session
      form.append("targetUsername", MWtargetUser);
      form.append("targetUserId", MWtargetUserId);
      form.append("messageContent", content);
      fetch("/node/messages/send", {
        method: "POST",
        body: form
     }).then(res => {
        console.log("res ", res);
        document.getElementById("windowRoot").style.display = "none";
        //reload messages to update view with new message
        let event = new Event("userSelected");
        document.dispatchEvent(event);
        //update users incase message to new user was sent
        let usersevent = new Event("usersUpdate");
        document.dispatchEvent(usersevent);
     })
  }

  return React.createElement('div', { className: 'messageWindow fustat-text' },
    React.createElement('h3', {className: 'MWtargetUser fustat-text', "data-name": props.target, "data-id": props.id}, 'Send a message to ' + props.target),
    React.createElement('form', {className: 'MWform'},
      React.createElement('input', {className: 'MWinput', type: 'text', placeholder: 'Type your message...'}),
      React.createElement('button', {className: 'MWbutton', type: 'button', id: 'MWbutton', onClick: sendMessage}, 'Send'),
    ),
    React.createElement('button', {className: 'MWcloseButton', onClick: closeWindow}, 'x' ),
    React.createElement('div', { className: 'MWOverlay'})
   );
   
}

  // call this to open the popup
  export function openWindow() {
    //document.querySelector(".messageWindow").style.display = "block";
    document.getElementById("windowRoot").style.display = "block";
  }


export default MessageWindow;