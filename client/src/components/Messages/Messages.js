import React from 'react';
import Message from './Message/Message'


const Messages = ({messages, username}) => (
    <div>
      {messages.map((message, i) => (
        <div key={i}><Message message={message.message} username={username} sender={message.sender} /></div>
      ))}
    </div>
)

export default Messages
