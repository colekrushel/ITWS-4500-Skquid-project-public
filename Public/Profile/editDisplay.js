import NavBar from "../navBarComponent/nav.js" 
var current_user_skills = []

function EditProfile(current_fields) {
  current_user_skills = current_fields.skills;

  function submitForm(event) {
    event.preventDefault();

    const updated_data = {
      name: document.getElementById("name-input").value,
      location: document.getElementById("location-input").value,
      picture: document.getElementById("picture-input").value,
      status: document.getElementById("status-input").value,
      bio: document.getElementById("bio-input").value
    };

    fetch(`/node/userdata/${current_fields.username}`, {
      method: "PUT",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(updated_data)
    }).then(response => {
      if (response.ok) {
        window.location.href = "/node/profile/";
      } else {
        return response.json().then(err => { throw new Error(err.error); });
      }
    })
  } 

  React.useEffect(() => {
    setup_search(current_fields.username);
  })

  console.log("2Props received in EditProfile:", current_fields);
  console.log("2Skills field in EditProfile:", current_fields.skills);

  return React.createElement('div', { className: 'profile-container' },
        React.createElement('div', { className: 'profile-edit-content' },
          React.createElement('div', { className: 'avatar-section' },
                  React.createElement('img', { className: 'avatar', src: current_fields.picture, alt: 'Profile' }),
                  React.createElement('span', { className: 'username' }, `@${current_fields.username}`)
          ),
          React.createElement('div', { className: 'profile-fields' },
              React.createElement('form', { className: 'edit-form' },
                  React.createElement('h2', { className: 'averia-text page-heading', id: 'edit-profile-heading' }, 'Edit Profile'),
                  React.createElement('div', { className: 'profile-field-labelset' },
                    React.createElement('p', { type: 'text', className: 'form-label' }, 'Name'), 
                    React.createElement('input', { type: 'text', id: 'name-input', maxLength: 28, defaultValue: current_fields.name})),
                  React.createElement('div', { className: 'profile-field-labelset' },
                    React.createElement('p', { type: 'text', className: 'form-label'}, 'Location'), 
                    React.createElement('input', { type: 'text', id: 'location-input', maxLength: 35, defaultValue: current_fields.location })),
                  React.createElement('div', { className: 'profile-field-labelset' },
                    React.createElement('p', { type: 'url', className: 'form-label' }, 'Link to Profile Picture'), 
                    React.createElement('input', { type: 'text', id: 'picture-input', defaultValue: (current_fields.picture && current_fields.picture.includes("../resources/")) ? "https://tutetitans.eastus.cloudapp.azure.com/node/resources/" + current_fields.picture.split("/").pop(): current_fields.picture})),
                  React.createElement('div', { className: 'profile-field-labelset' },
                    React.createElement('p', { type: 'text', className: 'form-label' }, 'Status'), 
                    React.createElement('input', { type: 'text', id: 'status-input', maxLength: 80, defaultValue: current_fields.status })),
                  React.createElement('div', { className: 'profile-field-labelset' },
                    React.createElement('p', { type: 'text', className: 'form-label' }, 'Bio'), 
                    React.createElement('textarea', { maxLength: 400, id: 'bio-input', defaultValue: current_fields.bio })),
                  React.createElement('button', { type: 'submit', className: 'averia-text', id: 'edit-profile-button', onClick: (event) => submitForm(event)}, 'Save changes')
              )),
          React.createElement('div', { className: 'skills-section'},
            React.createElement('h3', { className: 'averia-text edit-skill-heading' }, 'Edit Skills'),
            React.createElement("div", {id: "search-container"},
              React.createElement("div", {id: "skills-searchbar"},
                React.createElement("i", {className: "bi bi-search"}), 
                React.createElement("input", {type: "text", id:"skills-search-input", onKeyUp:() => refresh_search(), placeholder:"Add a skill"}),
              ),
              React.createElement("ul", {id: "skills-search-results"})
            ),
            React.createElement('div', {id: 'your-skill-display'},
              current_fields.skills.map(skill =>
                  React.createElement('div', { className: 'skill-tag', key: skill }, 
                    React.createElement('p', { className: 'skill-tag-text' }, skill),
                    React.createElement('i', { className: 'bi bi-x', onClick: (event) => remove_skill(event, skill, current_fields.username)})
                  )
              )
            )
          )
        )
   );
};

function setup_search(username) {
   fetch("/node/skills")
      .then(response => response.json())
      .then(data => {
         var search_results_init = "";
         var search_results = document.getElementById("skills-search-results");

         data.forEach(skill => {
            search_results_init += `<li class="skill-li" type-skill="${skill}">${skill} <span class='add-skill'>+</span></li>`;
         });

         search_results.innerHTML = search_results_init;
         search_results.style.display = "none";

         document.querySelectorAll('.skill-li').forEach(item => {
            item.addEventListener('click', function () {
               const skill = this.getAttribute('type-skill');
               select_skill(skill, username); 
            });
         });
      })
      .catch(error => {
         console.error("Error fetching skills:", error);
      });
}


function refresh_search() {
  var input, filter, ul, li, i, txtValue;
  input = document.getElementById('skills-search-input');
  filter = input.value.toUpperCase();
  ul = document.getElementById("skills-search-results");
  ul.style.display = "";
  li = ul.getElementsByTagName('li');
  var results_counter = 0;
  for (i = 0; i < li.length; i++) {
    txtValue = li[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1 && results_counter <= 2) {
      li[i].style.display = "";
      results_counter++;
    } else {
      li[i].style.display = "none";
    }
  }
}

function select_skill(skill, username) {
  fetch("/node/skills/" + username, {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({skillname: skill})
  })
  .then(response => response.json())
  .then(data => {
    if (!current_user_skills.includes(skill)) {
      current_user_skills.push(skill);
      var skill_display = document.getElementById("your-skill-display");
      skill_display.innerHTML += `<span class='skill-tag' key='${skill}'>${skill}</span>`;
    }
    console.log("hypothetically added new skill \"" + skill + "\" to mongo")
  }) 
}

function remove_skill(event, skill, username) {
  
  fetch("/node/skills/" + username, {
    method: 'DELETE', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({skillname: skill})
  })
  .then(response => response.json())
  .then(data => {
    event.target.parentElement.remove();
  }) 
}

function App(user) {
   return React.createElement(
     'div',
     null,
     React.createElement(NavBar, {active: "Profile"}),
     React.createElement(EditProfile, user)
   );
 }

export default App;