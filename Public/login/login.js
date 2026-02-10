import NavBar from "../navBarComponent/nav.js";

"use strict";

const handleLogin = (event, setUser) => {
  event.preventDefault();
  const username = event.target.username.value;
  const password = event.target.password.value;

  fetch("/node/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.username) {
        setUser(data.username);
        window.location.href = "../secondHomePage/index.html"; // Redirect on successful login
      } else {
        console.log(data.message || "Login failed.");
      }
    })
    .catch((err) => console.error(err));
};

const Login = ({ setUser }) => {
  return React.createElement(
    "form",
    { onSubmit: (event) => handleLogin(event, setUser) , className: "login-form" }, // Pass setUser to the function
    React.createElement("input", { type: "text", name: "username", placeholder: "Username", maxLength: 100, required: true }),
    React.createElement("input", { type: "password", name: "password", placeholder: "Password", maxLength: 100, required: true }),
    React.createElement("button", { className: "login-btn", type: "submit" }, "Login")
  );
};

const awaySignupButton = () => {
  return React.createElement(
    "button",
    {
      className: "away-btn",
      type: "button", // Change to "button" to prevent form submission
      onClick: function() {
        window.location.href = "../signup/index.html"; // Replace with your target URL
      }
    },
    "Sign Up"
  );
};

const App = () => {
  const [user, setUser] = React.useState(null);
 
   React.useEffect(() => {
     fetch("/node/session", { credentials: "include" })
       .then((res) => res.json())
       .then((data) => {
         if (data.loggedIn) {
           setUser(data.user);
         }
       });
   }, []);
 
   return React.createElement(
     "div",
     null,
     React.createElement("div", {className: "login-container"}, React.createElement(Login, { setUser })),
     React.createElement(awaySignupButton)
   );
};

let navRoot = ReactDOM.createRoot(document.getElementById("nav-root"));
navRoot.render(React.createElement(NavBar, {active: 'auth'}));
let docRoot = ReactDOM.createRoot(document.getElementById("main-root"));
docRoot.render(React.createElement((App)));
