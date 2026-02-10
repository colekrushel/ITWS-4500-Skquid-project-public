import App from "./editDisplay.js"

fetch(`/node/session`)
.then(response => response.json())
.then(session_data => {
   if (session_data.loggedIn) {
      fetch(`/node/userdata/${session_data.user}`)
      .then(response => {
         if (!response.ok) {
            throw new Error("User not found");
         }
         return response.json();
      })
      .then(data => {
         const rootNode = document.getElementById('profile-root');
         const root = ReactDOM.createRoot(rootNode);
         root.render(React.createElement(App, {username: session_data.user,
                                             name: data.profile_name, 
                                             location: data.profile_location, 
                                             picture: data.profile_picture, 
                                             status: data.profile_status,
                                             bio: data.profile_bio,
                                             skills: data.skills}))
      });
   } else {
      throw new Error("You need to be logged in.");
   }
});