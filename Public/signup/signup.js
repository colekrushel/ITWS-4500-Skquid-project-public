import NavBar from "../navBarComponent/nav.js";

"use strict";

const Signup = ({ setUser }) => {
  const [validationMessage, setValidationMessage] = React.useState("");

   const handleSignup = (event) => {
     event.preventDefault();
     const username = event.target.username.value;
     const password = event.target.password.value;

    if (!username || !password) {
    setValidationMessage("Username and password are required.");
    return;
    }
    if (password.length < 8) {
      setValidationMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setValidationMessage("Password must contain at least one capital letter.");
      return;
    }
    if (!/\d/.test(password)) {
      setValidationMessage("Password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setValidationMessage("Password must contain at least one special character.");
      return;
    }

    setValidationMessage("");

    fetch("/node/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
         if (data.username) {
            setUser(data.username);
            window.location.href = "../secondHomePage/index.html"; // Redirect on successful signup
         } else {
          setValidationMessage(data.message || "Signup failed.");
         }
      })
      .catch((err) => {
        console.error(err);
        setValidationMessage("An error occurred during signup.");
      });
  };
 
   return React.createElement(
     "form",
     { onSubmit: handleSignup , className: "signup-form" },
     React.createElement("input", { type: "text", name: "username", placeholder: "Username", maxLength: 100, required: true }),
     React.createElement("input", { type: "password", name: "password", placeholder: "Password", maxLength: 100, required: true }),
     validationMessage
      ? React.createElement("div", { className: "validation-message" }, validationMessage)
      : null,
     React.createElement("button", { className: "signup-btn", type: "submit" }, "Sign Up")
   );
};

const awayLoginButton = () => {
  return React.createElement(
    "button",
    {
      className: "log-btn",
      type: "button",
      onClick: function() {
        window.location.href = "../login/index.html"; // Replace with your target URL
      }
    },
    "Login"
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
     React.createElement("div", {className: "signup-container"}, React.createElement(Signup, { setUser })),
     React.createElement(awayLoginButton)
   );
};

let navRoot = ReactDOM.createRoot(document.getElementById("nav-root"));
navRoot.render(React.createElement(NavBar, {active: 'auth'}));
let docRoot = ReactDOM.createRoot(document.getElementById("main-root"));
docRoot.render(React.createElement((App)));
