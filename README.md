# EasyTalkv2
EasyTalkv2 is the 2nd version of EasyTalk - a full stack chat application. Visit the website <a target="_blank" href="https://easytalkv2.netlify.app/">here</a>.

EasyTalk is a chat application that allows users to send messages to other individuals privately, and to an "All Chat" that is shared by all signed up users. 
The backend is built on Node.js and Express.js and hosted on Heroku. The server uses WebSockets from the Socket.io library to allow the client and server to
communicate when a user sends a chat message. Because socket.io is used, it allows the client to only request information from the server once at the beginning,
allowing for quick and light requests using Axios and preventing the server from being overworked. Because each socket is paired with a username, users can send
private messages to each other. User profiles and all their messages are stored in a MongoDB collection, which allows users to pick up conversation from where
they left off. Authentications when logging in to the application are handled with JSON Web Tokens that are stored inside browser cookies, all handeled on the
back end. All GET/POST requests are handeled by axios.
The front end of the application is built entirely in React, using the react-router-dom library to Link between pages, and is deployed on Netlify.

Version 2 has added personalization. Users can now change the colors of the chat once logged in, allowing users to experience a more personalized app. An
audio option has also been added to read aloud a message that the user has typed to allow users to listen to what they have typed and correct it before sending.
