'use strict';


const Logout = ({ setUser }) => {
  const handleLogout = () => {
    fetch("/node/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => setUser(null))
      .catch((err) => console.error(err));
  };

  return React.createElement(
    "a",
    { className: "logout averia-text", onClick: handleLogout, href: "/node/" }, 
    "Log out"
  );
};

const LoginButton = () => {
  return React.createElement(
    "a",
    { className: "logout averia-text", href: "../login/index.html" }, // Apply class and set href
    "Login"
  );
};

function logButton() {
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
    user
      ? React.createElement(Logout, { setUser })
      : React.createElement(LoginButton)
  );
  
}

function checkSession(setUser) {
  fetch("/node/session", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      if (data.loggedIn) {
        setUser(data.user);
      } else {
        setUser(null); // Clear user if not logged in
      }
    })
    .catch((error) => {
      console.error("Session check failed:", error);
      setUser(null); // On error, treat as not logged in
    });
}

function NavBar(params) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState('');

  React.useEffect(() => {
    checkSession(setUser);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return React.createElement('header', { className: 'navbar' },
    React.createElement('a', { href: 'https://tutetitans.eastus.cloudapp.azure.com/node/secondHomePage/index.html' },
      React.createElement('img', { className: 'logo-img', src: '../resources/Skquid_H.svg', alt: 'Skquid Logo' })
    ),
    (params.active === "auth" || !user) ? null :
    React.createElement(
      React.Fragment,
      null,
      React.createElement('button', {
        className: 'hamburger',
        onClick: toggleMenu
      }, '☰'),
      React.createElement('nav', { className: 'links' + (isOpen ? '' : ' hidden') },
        React.createElement('a', { className: 'averia-text ' + ((params.active === "Home") ? 'active-page' : 'inactive-page'), href: '../secondHomePage/index.html' }, 'Home'),
        React.createElement('a', { className: 'averia-text ' + ((params.active === "Search") ? 'active-page' : 'inactive-page'), href: '../Searching/index.html' }, 'Search'),
        React.createElement('a', { className: 'averia-text ' + ((params.active === "Profile") ? 'active-page' : 'inactive-page'), href: '../profile/' }, 'Profile'),
        React.createElement('a', { className: 'averia-text ' + ((params.active === "Messages") ? 'active-page' : 'inactive-page'), href: '../Messaging/index.html' }, 'Messages')
      )
    ),
    React.createElement(logButton)
  );
}


export default NavBar;