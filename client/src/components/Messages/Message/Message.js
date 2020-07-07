import React from 'react';
import './Message.css';

//It's called destructuring when taking in props like this

//The .name and .message below are from the app.js when I take in a name, room, and message, and emit a message call
//that emits a {message, name} object and gets received back in ChatRoom.js
const Message = ({message, username, sender}) => {
  if(sender !== username){
    return(
      <div className="notMe">
        <p id="name">{sender}</p>
        <p id="message-notme">{message}</p>
      </div>
    )
  }else{
    return(
      <div className="Me">
        <p id="name">{sender}</p>
        <p id="message-me">{message}</p>
      </div>
    )
  }
}

export default Message
