import React, { useState, useEffect, useRef} from 'react';
import './ChatMessages.css';

function ChatMessages({ messages, selectedChat }) {
  // Scroll to the bottom of the window when the messages array changes
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, [messages]);
  
  // Hide component if 'newchat'
  if (selectedChat === 'newchat') {
    return null;
  }

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message[0] === 'user' ? 'user-message' : 'assistant-message'}`}
        >
          <p className="message-content">{message[1]}</p>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessages;