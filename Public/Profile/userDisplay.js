import NavBar from "../navBarComponent/nav.js";
import MessageWindow from "../Messaging/components/MessageWindow.js";

function EditProfile(user) {
  var total_width = 0;
  var skills_to_display = [];
  var extra_counter = 0;
  var extra = false;

  (user.skills || []).forEach(skill => {
    total_width += skill.length;
    console.log(skill.length + "/" + total_width);
    if (total_width <= 140){
      skills_to_display.push(skill);
    } else {
      extra_counter++;
      extra = true;
    } 
  });
  
  const skill_children = [];
  
  if ((user.skills || []).length === 0) {
    skill_children.push(
      React.createElement('p', { className: 'no-skills'}, "This user has not shared any skills yet!")
    );
  } else {
    skills_to_display.forEach(skill => {
      skill_children.push(
        React.createElement('span', { className: 'profile-skill', key: skill }, skill)
      );
    });
  
    if (extra) {
      skill_children.push(
        React.createElement('span', { className: 'profile-skill extra-skills', onClick: () => display_all_user_skills(user.skills)}, `+${extra_counter}`)
      );
    }
  }

  return React.createElement('div', { className: 'profile-container' },
    React.createElement('div', { className: 'profile-card' },
      React.createElement('div', { className: 'upper-card' },
        React.createElement('div', { className: 'avatar-side' },
          React.createElement('img', { className: 'profile-avatar', src: user.avatar, alt: 'Profile' }),
          React.createElement('span', { className: 'profile-username'}, `@${user.un}`),
          React.createElement('div', { className: 'profile-buttons'},
            ((user.relationship == "self") ? React.createElement('a', { id: 'edit-btn', className: 'averia-text profile-btn', href:"/node/Profile/edit.html"}, 
              React.createElement('i', { className: 'bi bi-pencil'}), 
              React.createElement('p', { className: 'averia-text'}, 'Edit Profile')) : 
                ((user.relationship == 'strangers') ? React.createElement('button', { id: 'friend-btn', className: 'averia-text profile-btn', onClick: () => send_friend_request(user.un)},
                  React.createElement('i', { id: 'friend-icon', className: 'bi bi-person-plus-fill bi-prof-btn'}), 
                  React.createElement('p', { id: 'friend-text', className: 'averia-text'}, 'Add Friend'))
                  : (user.relationship == 'requested') ? React.createElement('button', { id: 'requested-btn', className: 'averia-text profile-btn'},
                    React.createElement('i', { className: 'bi bi-clock-history bi-prof-btn'}), 
                    React.createElement('p', { id: 'requested-text', className: 'averia-text'}, 'Request Pending'))
                    : React.createElement('button', { id: 'unfriend-btn', className: 'averia-text profile-btn',  onClick: () => unfriend(user.un)},
                      React.createElement('i', { id: 'unfriend-icon',className: 'bi bi-person-x-fill bi-prof-btn'}), 
                      React.createElement('p', { id: 'unfriend-text', className: 'averia-text'}, 'Unfriend')))
              ), 
              ((user.relationship == "self") ? null : React.createElement('button', { id: 'exchange-btn', className: 'averia-text profile-btn', onClick: () => open_message_window(user.name, user.userId)},
              React.createElement('i', { className: 'bi bi-arrow-left-right'}), 
              React.createElement('p', { id: 'exchange-text', className: 'averia-text'}, 'Skill Exchange'))))),
          React.createElement('div', { className: 'info-side' },
          React.createElement('p', { className: 'profile-name' }, user.name),
          React.createElement('div', { className: 'averia-text loc-horizontal' }, 
            React.createElement('i', { className: 'bi bi-geo-alt-fill'} ), 
            React.createElement('p', { className: 'profile-location' }, user.loc )),
          React.createElement('p', { className: 'profile-status' }, user.status),
          React.createElement('p', { className: 'profile-bio', style: {fontSize: user.font_pt + "px"} }, user.bio),
        ),
        React.createElement("button", {
          id: "share-profile-btn",
          onClick: () =>  {
            navigator.clipboard.writeText(window.location.href)
            .then(() => {
              var share_btn = document.getElementById("share-profile-btn");
              share_btn.innerHTML = "Link copied!"
              setTimeout(() => {
                share_btn.innerHTML = "Share Profile";
              }, 2000);
            })
          }
        }, "Share Profile"),
        React.createElement("div", {id: "friend-count-display", onClick: () => {display_all_friends(user.un, user.friends)} }, 
          React.createElement("p", {id: "friend-count-text"}, user.friend_count),
          React.createElement("p", {id: "friend-count-label"}, "Friends"), 
        )
      ),
      React.createElement('div', { className: 'lower-card' }, ...skill_children)
    ),
    React.createElement('dialog', { id: 'friends-modal'},
      React.createElement('i', { className: 'bi bi-x modal-close', onClick: (event) => {event.target.parentElement.close()}}),
      React.createElement('h2', { className: 'friends-list-header'}, user.un + "'s Friends"),
      React.createElement('div', { id: 'friends-list-container'},
        ...user.friends.map((username) =>
          add_friend_to_display(username)
        )
      )
    ),
    React.createElement('dialog', { id: 'skills-modal'},
      React.createElement('i', { className: 'bi bi-x modal-close', onClick: (event) => {event.target.parentElement.close()}}),
      React.createElement('h2', { className: 'skills-list-header'}, user.un + "'s Skills"),
      React.createElement('div', { id: 'skills-list-container'})
    ),
    React.createElement('dialog', { id: 'windowRoot'},
    )
  );
};

function send_friend_request(requested) {
  fetch("/node/friends/requests", {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({requested_user: requested})
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.reload();
    }
  }) 
}

function unfriend(requested) {
  fetch("/node/friends/" + requested, {
    method: 'DELETE', 
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.reload();
    }
  }) 
}

function display_all_friends(username, friends) {
  document.getElementById("friends-modal").showModal();
}

function add_friend_to_display(username) {
  fetch("/node/userdata/" + username)
  .then(response => response.json())
  .then(data => {
    var container = document.getElementById("friends-list-container");
    container.innerHTML += `<div class='friend-record'><img class='friend-list-pfp' src='${data.profile_picture}'><div class='friend-identifiers'><a class="friend-un" href='https://tutetitans.eastus.cloudapp.azure.com//node/user/${username}'>@${username}</a><p class='friend-name'>${data.profile_name}</p></div></div>`;
  })
}

function display_all_user_skills(skills) {
  document.getElementById("skills-modal").showModal();
  for (var skill of skills) {
    add_skill_to_display(skill);
  }
}

function add_skill_to_display(skill) {
  var container = document.getElementById("skills-list-container");
  container.innerHTML += `<span class='profile-skill'>${skill}</span>`;
}

function open_message_window(name, userID) {
  var windowRoot = ReactDOM.createRoot(document.getElementById('windowRoot'));
  windowRoot.render(React.createElement(MessageWindow, {target: name, id: userID}));
}

function App(user) {
   return React.createElement(
     'div',
     null,
     React.createElement(NavBar, {active: (user.highlight) ? "Profile" : "Profile Other"}),
     React.createElement(EditProfile, user)
   );
}

export default App;