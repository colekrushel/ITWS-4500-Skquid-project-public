'use strict';


export function UserButton(props) {
   React.useEffect( () => {
    //only activate on add button load
    if(props.type == "selected"){
      let event = new Event("usersLoad");
      document.dispatchEvent(event);
    }

   })
  

  return React.createElement(
    'figure',
    {
      onClick: (e) => {
           //remove prev selected item
        //ignore add button
        if(e.currentTarget.getAttribute("data-user") == "Add"){
          console.log("dont select add");
          let event = new Event("addButtonTrigger");
          document.dispatchEvent(event);
          return;
        }
        let prevSelected = document.querySelector(".selected");
        if(prevSelected){
            prevSelected.classList.remove("selected");
        }
        //give clicked on elm the 'selected tag'
        e.currentTarget.classList.add("selected");
        //pull chat info and add to dom
        let selectedName = e.currentTarget.firstChild.textContent;
        //getMessages(selectedName);
        let event = new Event("userSelected");
        document.dispatchEvent(event);
         
      },
      key: "figure" + props.name,
      "data-name": props.name,
      "data-user": props.id,
      className: props.type
    },
    
    
    React.createElement(
      'figcaption', 
      {key: "figcaption" + props.name, className: "averia-text"},
      props.name
      
    ),
    
    React.createElement(
      'img',
      {src: props.pfp, key: "img" + props.name}
    ),
    
  );
}

export function updateUsers(){
  //check if a new user is added (can we just run usersInit again?)
}

export function usersInit(currUsername, currUserId, root, allUserMessages){

  //renders here are for testing; in the real app they would be dynamically generated
  
  //get logged in user
  let loggedInUsername = currUsername,
  loggedInId = currUserId;
  //get all users that current user has contacted before 
  //create a list of unique target users found and create an element for each one
  let uniqueUsers = [],
  idArray = [];
  fetch("/node/messages/" + loggedInId + "").then(res => res.json()).then(res => {
    //filter messages for only those that match the targetuser
    for(let i=0; i < res.length;i++){
      let message = res[i];
      if((!idArray.includes(message.target.id) && message.target.id != loggedInId) || (!idArray.includes(message.sender.id) && message.sender.id != loggedInId)){
        if(message.target.id == loggedInId){
          uniqueUsers.push(message.sender);
          idArray.push(message.sender.id)
        } else {
          uniqueUsers.push(message.target);
          idArray.push(message.target.id)
        }
      }
    }
    getItems(uniqueUsers, root)
  });
}

//turn array of unique usernames into react elements and render
export async function getItems(uniqueUsers, root){
  let reactArray = []
  for(let i=0;i<uniqueUsers.length;i++){
    //get detailed user info for each unique user
    await fetch("/node/userdata/" + uniqueUsers[i].name).then(res => res.json()).then(res => {
      console.log("res ", res);
      if(i == 0){
        reactArray.push(React.createElement(UserButton, {name: uniqueUsers[i].name, type: "selected", key: uniqueUsers[i].id, id: uniqueUsers[i].id, pfp: res.profile_picture}));
      }else {
        reactArray.push(React.createElement(UserButton, {name: uniqueUsers[i].name, key: uniqueUsers[i].id, id: uniqueUsers[i].id, pfp: res.profile_picture}));
      }
    })

  }
  renderItems(reactArray, root);

}

export function renderItems(items, root){
  //if no users are found then adjust main styling
  if(items.length == 0){
    document.getElementById("chatTitle").textContent = "No ongoing chats"
  } else {
    document.querySelector(".chat-input").style.display = "flex";
  }
  //add 'add' button to render array
  items.push(React.createElement(UserButton, {name: "Add", type: "addUser", key: "Add", id: "Add", pfp: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}));
  //root.render([React.createElement(UserButton, {name: "Joe", key: "Joe"}), React.createElement(UserButton, {name: "Jill", key: "Jill"}), React.createElement(UserButton, {name: "Jim", key: "Jim"}), React.createElement(UserButton, {name: "Add", type: "addUser", key: "Add"})])
  root.render(items);
}


