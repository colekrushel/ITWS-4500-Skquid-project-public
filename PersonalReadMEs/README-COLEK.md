When I decided on what to work on for this project, I quickly decided that I wanted to work on the messaging aspect of the website - I had always heard about websocket technology and I've always wanted to try implementing it in an application of my own. After all, how difficult could it be? While I don't regret that decision, I realize now that the implementation would be both easier and more frustrating than I could have ever imagined all at the same time.

To begin, the front-end implementation for the chatting feature wasn't too bad, with a bit of a learning curve at the beginning due to inexperience with React but pretty smooth sailing soon after I grasped how to use React components. My components at first were pretty hamfisted, and not very dynamic, with lots of nested divs which proved to be nothing but trouble when implementing features like scrolling down when loading new messages. I was able to rework the user list component and messaging component to dynamically fetch items from the database which were then converted into React elements and passed into a parent Component - this allowed me to keep track of currently existing components and re-render the parent when a new child is added, which thanks to React's structure would successfully update the parent component on the page without requiring a complete re-render. I hated using React at first, but after adopting a more dynamic and component based design structure, I began to appreciate it significantly more. So the front end was pretty successful, with a little help from ChatGPT for styling advice and some struggles with React callbacks (if only I had known about UseEffect earlier!)

The back-end was supposed to be the easy part - just a few endpoints for receiving and sending messages, nothing too different from what we did in our labs. And it was, at least the MongoDB integration with our Api was pretty simple after finally deciding on what schema to use and what information we need to pull from the appropriate user. Even the Websocket server was pretty easy at first - deceptively so, requiring only adapting a few examples from documentation and voila - I had a front end that would send messages to the back end which would then be received by all logged-in users. Everything was looking up, that is until I tried adjusting the Websocket implementation to work on the Azure server.

It was then that I realized the true horror of implementing Websockets - getting the damn handshake to be accepted between client and server! The websocket could be created on the server with the same way and it would start listening, what wouldn't happen however is the client actually creating the connection between the two. Initially, I had thought it was due to the insecurity of the socket, and it sort of was, but after adjusting it for WSS the connection still failed. Even now, after countless hours of attempts at fixing and trying new solutions (just look at my commit amount... not my proudest moment) I still can only assume that the failures are due to how Azure is interpreting the connection. Through testing I learned that the only port allowed access by Azure is 443, which then gets redirected to our local node app at port 3000 through ProxyPass. I attempted to replicate similar behavior with the websocket connection, but for reasons I can only begin to guess at, no configuration of ProxyPass would actually redirect the websocket connection - the errors always pointed to the FQDN and never the localhost which it was supposed to be redirecting to, even though the same exact syntax works with the /node URL endpoint!

Though I did manage to achieve a similar implemented on the VM without websockets with an admittedly hacky and inefficient solution - the front end simply runs constant checks from the database for new messages to the logged in user and updates the user's display when necessary. The result is basically the same, its just less efficient.

At the end of the day, this project was a pretty significant learning experience for me. Not just in learning React and Mongo technologies - while that was certainly a significant part of it, I also learned not to be so stubborn, as I was adamant on solving the Websocket issue myself but ultimately came to the conclusion that I would need the help of an administrator to understand how Apache was even configured on the server to know how to use it.


Sources


https://stackoverflow.com/questions/23686379/how-to-make-websockets-to-go-through-a-proxy-in-node-js
https://stackoverflow.com/questions/23384205/websocket-server-running-fine-but-cannot-connect-from-client-what-url-should-i
https://dnschecker.org/port-scanner.php?query=tutetitans.eastus.cloudapp.azure.com
https://httpd.apache.org/docs/2.4/mod/mod_proxy.html
https://stackoverflow.com/questions/43552164/websocket-through-ssl-with-apache-reverse-proxy
https://community.home-assistant.io/t/solved-apache-reverse-proxy-websocket/258249
https://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
https://stackoverflow.com/questions/4075287/node-express-eaddrinuse-address-already-in-use-how-can-i-stop-the-process
https://stackoverflow.com/questions/18891755/force-word-wrap-through-css
https://stackoverflow.com/questions/60368017/await-has-no-effect-on-the-type-of-this-expression
https://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onchange-event-manually
https://stackoverflow.com/questions/34893506/return-multiple-elements-inside-react-render
https://stackoverflow.com/questions/49616639/how-can-i-export-all-functions-from-a-file-in-js
https://stackoverflow.com/questions/37200460/waiting-for-a-promise-to-resolve-before-function-returns-a-value
https://stackoverflow.com/questions/28680295/mongodb-query-on-the-last-element-of-an-array
https://www.npmjs.com/package/ws