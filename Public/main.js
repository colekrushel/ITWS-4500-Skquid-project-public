'use strict';

function LandingHeading() {
  return React.createElement(
    'nav',
    { className: 'landing-heading' },
    React.createElement(
      'div',
      { className: 'nameContainer' },
      React.createElement(
        'h1',
        { className: 'webName' },
        'Skquid'
      ),
      React.createElement(
        'span',
        { className: 'nameBtmTxt' },
        'quid pro quo'
      )
    ),
    React.createElement(
      'a',
      { className: 'loginButton', href: 'login/index.html' },
      'Login'
    )
  );
}

function waveSVG() {
  return React.createElement(
    'svg',
    {
      viewBox: '0 0 500 200',
      preserveAspectRatio: 'none',
      className: 'waveClass'
    },
    React.createElement('path', {
      d: 'M 0,100 C 150,200 350,0 500,100 L 500,200 L 0,200',
    })
  );
}

function LandingPage() {
  return React.createElement(
    'div',
    { className: 'container' },

    React.createElement(waveSVG),

    React.createElement(
      'div',
      { className: 'placeholderImage' },
      React.createElement(
        'img',
        {
          src:"resources/Skquid_V.svg"
        }
      )
    ),

    React.createElement(
      'div',
      { className: 'floatingText text1' },
      'share your skills with others'
    ),
    React.createElement(
      'div',
      { className: 'floatingText text2' },
      'meet people who share your interests'
    ),
    React.createElement(
      'div',
      { className: 'floatingText text3' },
      'find your new favorite hobby'
    ),

    React.createElement(
      'a',
      { 

        href: 'signup/index.html',
        className: 'signupButton'

      },
      'Sign Up'
    )
  );
}

function App() {
  return React.createElement(
    'div',
    null,
    React.createElement(LandingHeading),
    React.createElement(LandingPage)
  );
}

const rootNode = document.getElementById('main-root');
const root = ReactDOM.createRoot(rootNode);
root.render(React.createElement(App));