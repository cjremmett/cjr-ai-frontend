import React from 'react';
import './ChatSelectorPane.css';
import classNames from 'classnames';

function ChatSelectorPane({ chats, selectedChat, handleSelectChat }) {
  function getChatPaneClasses(chat)
  {
    let classes = 'chat-item';
    if(chat.chatid === 'newchat')
    {
      classes += ' new-chat-button';
    }
    if(selectedChat === chat.chatid)
    {
      classes += ' selected';
    }
    return classes;
  }

   return (
    <div className="chat-selector-pane">
      {chats.map((chat) => (
        <div
          key={chat.chatid}
          className={ getChatPaneClasses(chat) }
          onClick={() => handleSelectChat(chat.chatid)}
        >
          {`${chat.chatid !== 'newchat' ? chat.ticker + ' - Q' + chat.quarter + ' ' + chat.year: 'Start New Chat'}`}
        </div>
      ))}
    </div>
  );
}

export default ChatSelectorPane;
