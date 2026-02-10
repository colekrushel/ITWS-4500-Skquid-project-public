import App from "./userDisplay.js"

const path = window.location.pathname;  
const username = path.split("/").pop();

fetch(`/node/userdata/${username}`)
  .then(response => {
    if (!response.ok) {
      throw new Error("User not found");
    }
    return response.json();
  })
  .then(data => {

   var bio_length = data.profile_bio.length;
   var font_size = 16.5;

   if (bio_length < 80) {
      font_size = 20;
   } else if (bio_length < 160) {
      font_size = 19;
   } else if (bio_length < 240) {
      font_size = 18.25;
   } else if (bio_length < 320) {
      font_size = 17.5;
   }

   fetch('/node/session')
   .then(response => response.json())
   .then(session_data => {
      console.log(data);
      var nav_highlight = (session_data.user == username) ? true : false;
      var user_relationship = "strangers";
      if (session_data.user == username) {
         user_relationship = "self";
      } else if (data.friends.includes(session_data.user)) {
         user_relationship = "friends";
      } else if (data.friend_requests.includes(session_data.user)) {
         user_relationship = "requested";
      }
      console.log(user_relationship)
      const rootNode = document.getElementById('profile-root');
      const root = ReactDOM.createRoot(rootNode);
      root.render(React.createElement(App, {un: username,
                                          name: data.profile_name, 
                                          loc: data.profile_location, 
                                          status: data.profile_status, 
                                          avatar: data.profile_picture,
                                          bio: data.profile_bio,
                                          skills: data.skills,
                                          relationship: user_relationship,
                                          friends: data.friends,
                                          friend_count: data.friends.length,
                                          font_pt: font_size,
                                          userId: data.userID,
                                          highlight: nav_highlight}))
   });
});