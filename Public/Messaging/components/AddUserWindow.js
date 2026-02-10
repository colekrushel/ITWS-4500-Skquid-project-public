
export function UserWindow(props) {
   React.useEffect( () => {
      closeWindow();
   })
   // call this to close the popup
   function closeWindow() {
     //document.querySelector(".messageWindow").style.display = "none";
     document.getElementById("UWRoot").style.display = "none";
   }
 
   return React.createElement('div', { className: 'userWindow fustat-text' },
     React.createElement('h3', {className: 'UWtitle'}, "Start talking with a friend?"),
     //(friendList(props.callback)),
     props.elms,
     React.createElement('button', {className: 'UWcloseButton', onClick: closeWindow}, 'x' ),
     React.createElement('div', { className: 'UWOverlay'})
    );
    
 }
 
// call this to open the popup
export function openWindow() {
   //document.querySelector(".messageWindow").style.display = "block";
   document.getElementById("UWRoot").style.display = "block";
}
 
 
// export default UserWindow;