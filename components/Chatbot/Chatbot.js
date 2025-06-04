"use client";
import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import ChatMessages from './ChatMessages';
import TickerAndQuarterSelector from './TickerAndQuarterSelector';
import InputArea from './InputArea';
import ChatSelelectorPane from './ChatSelectorPane';
import { socket } from "../../socket";
import GoogleSignIn from "./GoogleSignIn"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';

let baseUrl = 'https://ectai.cjremmett.com';

function Chatbot() {

  const [chats, setChats] = useState([]);
    // Should be in the following format:
    //   [
    //     {
    //         "userid": "cjr-userid-example",
    //         "chatid": "cjr-chatid-example",
    //         "ticker": "AAPL",
    //         "year": 2025,
    //         "quarter": 1,
    //         "timestamp": 123
    //     },
    //     {
    //         "userid": "cjr-userid-example",
    //         "chatid": "cjr-chatid-example",
    //         "ticker": "AAPL",
    //         "year": 2025,
    //         "quarter": 1,
    //         "timestamp": 123
    //     }
    //   ]

  const [messages, setMessages] = useState([]);
    // Should be in the following format:
    //   [
    //     [
    //         "user",
    //         "Some user question."
    //     ],
    //     [
    //         "assistant",
    //         "Some AI response."
    //     ]
    //   ]

  const [selectedChat, setSelectedChat] = useState('newchat');

  const [currentTicker, setCurrentTicker] = useState('');
  const [currentQuarter, setCurrentQuarter] = useState('');

  // Controls whether the user can send a message to the backend
  const [inputEnabled, setInputEnabled] = useState(true);
  const [userid, setUserid] = useState(null);

  // newChatMessage is the text displayed on the new chat window. It gets changed to an error message if the user enters a bad ticker, API has no data, etc.
  const defaultNewChatMessage = "Please select a stock ticker and quarter. The AI will use RAG to answer questions about the earnings call transcript for that quarter, even if it falls outside the model's knowledge cutoff.";
  const [newChatMessage, setNewChatMessage] = useState(defaultNewChatMessage);

  // Controls whether to show the error message
  const [newChatError, setNewChatError] = useState(false);
  
  // Disables the button to start a new chat while it's already processing a previous request to start a new chat
  const [newChatWorking, setNewChatWorking] = useState(false);

  // Contains the authorization token for completing the OAuth handshake
  const [user, setUser] = useState(null);
  // Contains user profile information (e.g. name, email, google id)
  const [profile, setProfile] = useState(null);

  // Returns the quarter as an integer (e.g., 1 for "Q1 2025")
  function getQuarterFromString(qString) {
    const match = /^Q(\d)\s+\d{4}$/.exec(qString);
    return match ? parseInt(match[1], 10) : null;
  }

  // Returns the year as an integer (e.g., 2025 for "Q1 2025")
  function getYearFromString(qString) {
    const match = /^Q\d\s+(\d{4})$/.exec(qString);
    return match ? parseInt(match[1], 10) : null;
  }

  // Clears chats and notifies user if there's a failure to connect to the backend
  // Error handling could be much more graceful but I don't want to spend all my time on that instead of application logic
  function handleConnectionFailure()
  {
    setChats([{
      "userid": 'dummy',
      "chatid": 'newchat',
      "ticker": "",
      "year": null,
      "quarter": null,
      "timestamp": 0
    }]);
    alert('Failed to connect to the server. Please try again later.');
  }

  const handleNewChat = async () => {
    try 
    {
      if (currentTicker && currentQuarter) {
        setNewChatWorking(true);
        const data = {
          userid: userid,
          ticker: currentTicker,
          quarter: getQuarterFromString(currentQuarter),
          year: getYearFromString(currentQuarter)
        };
  
      let response = await fetch(baseUrl + '/start-new-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if(response.status > 400)
      {
        handleConnectionFailure();
        return;
      }
      else if(response.status === 400)
      {
        setNewChatMessage("We were unable to retrieve an earnings call transcript for the ticker and quarter you selected. Please double check your input. Note that the transcript service may not have transcripts for all publicly listed stocks - try a ticker for a large and well known company, such as AAPL or MSFT.")
        setNewChatError(true);
        return;
      }
      else
      {
        setNewChatMessage(defaultNewChatMessage);
        setNewChatError(false);
      }
  
      // If we pulled the transcript OK, make API call to get updated list of chats
      // and then switch to the newly created one.
      response = await response.json();
      const newChatKey = response['chatid'];
      // Uses a dummy chat element to respresent the new chat window
      fetch(baseUrl + '/get-earnings-call-chats-for-user?userid=' + userid)
        .then(response => response.json())
        .then(data => setChats([{
              "userid": userid,
              "chatid": 'newchat',
              "ticker": "",
              "year": null,
              "quarter": null,
              "timestamp": 0
          },...data]))
        .then(() => setSelectedChat(newChatKey))
        .catch(() => {handleConnectionFailure()})
      }
      else
      {
        setNewChatMessage("Please enter a ticker and select a quarter before starting a new chat.")
        setNewChatError(true);
      }
    }
    finally
    {
      setNewChatWorking(false);
    }
  };

  const handleSelectChat = (chatid) => {
    setSelectedChat(chatid);
  };

  // Uses Google library to handle OAuth handshake
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Google Sign In Failed:', error),
  });

  // Clean up Google account info.
  // RefreshUserId() is called by the useEffect function on user change.
  const logOut = () => {
    googleLogout();

    // Clear Google account info from localstorage
    localStorage.removeItem('cjremmett-ai-googleProfile');
    localStorage.removeItem('cjremmett-ai-googleUser');

    setProfile(null);
    setUser(null);
  };

  // Retrieves the user's unique Google ID as a string if it exists, otherwise returns null
  function getGoogleAccountUserId() {
    const storedProfile = localStorage.getItem('cjremmett-ai-googleProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        return profile.id || null;
      } catch {
        return null;
      }
    }
    return null;
  } 

  // Makes an API call to update the list of chats
  function populateChats()
  {
    // Uses a dummy chat element to respresent the new chat window
    fetch(baseUrl + '/get-earnings-call-chats-for-user?userid=' + userid)
      .then(response => response.json())
      .then(data => setChats([{
            "userid": userid,
            "chatid": 'newchat',
            "ticker": "",
            "year": null,
            "quarter": null,
            "timestamp": 0
        },...data]))
      .catch(() => {handleConnectionFailure()})
  }

  const getUserId = () => {
    console.log('Triggered userid refresh.');

    // Use the Google ID if available, if not then
    // use the local ID, if that doesn't exist either then
    // call the backend to get a new local ID
    let googleAccountUserId = getGoogleAccountUserId();
    let localTempId = localStorage.getItem('cjr-ai-userid');
    if(googleAccountUserId)
    {
      return googleAccountUserId;
    }
    else if(localTempId)
    {
      return localTempId;
    }
    else
    {
      // If not found, fetch a new userid from the server
      fetch(baseUrl + "/get-new-ai-userid")
        .then(response => response.json())
        .then(data => {
          if(data.userid)
          {
            localStorage.setItem('cjr-ai-userid', data.userid);
            return data.userid;
          }
          else
          {
            handleConnectionFailure();
          }
        })
        .catch(() => {handleConnectionFailure()})
    }
  };
  
  useEffect(() => {
    console.log('Initial render triggered...');
    // Load profile from localStorage on initial render
    const storedProfile = localStorage.getItem('cjremmett-ai-googleProfile');
    if(storedProfile)
    {
      setProfile(JSON.parse(storedProfile)); // Parse JSON string to object
    }

    setUserid(getUserId());
  }, []);

  // Only called when the user logs in or out of their Google account
  // Upon logout only refreshes userid
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${user.access_token}` },
          });
          const data = await res.json();
          setProfile(data);
          localStorage.setItem('cjremmett-ai-googleUser', JSON.stringify(user)); // Store user in localStorage
          localStorage.setItem('cjremmett-ai-googleProfile', JSON.stringify(data)); // Store profile in localStorage
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }
    
    fetchProfile().then(() => setUserid(getUserId()));
  }, [user]);

  useEffect(() => {
    if(userid)
    {
      populateChats();
    }
  }, [userid]);
    
  // Make an API call to populate the contents of the chat the user switched to.
  // If they're in newchat, clear the message array.
  // An improvement would be to make this API call when the user hovers over the chat
  // button rather than when they click to make the UI appear faster. I could also cache
  // the results locally and show the cache while making the API call to update the messages
  // with the authoritative backend chat history.
  useEffect(() => {
    if(selectedChat !== 'newchat')
    {
      fetch(baseUrl + '/get-earnings-call-chat-message-history?chatid=' + selectedChat)
      .then(response => response.json())
      .then(data => setMessages(data))
      .catch(() => {handleConnectionFailure()})
    }
    else
    {
      setMessages([[]]);
    }
  }, [selectedChat]);

  // Enable or disable the button to send a message when a new message comes in
  // depending on whether the last message is the response from the AI model.
  // Gets set to disabled when the user presses the send button because there is
  // a small time lag between sending the message and receiving the response
  // from the backend via websocket.
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if(lastMessage && lastMessage[0] === 'assistant')
    {
      setInputEnabled(true);
    }
    else
    {
      setInputEnabled(false);
    }
  }, [messages]);

  // Sends message to backend to get a response from the AI model
  // Doesn't automatically put message in chat - wait until confirmation from
  // backend to populate the user's message in the UI.
  const handleSendMessage = (newMessage) => {
    if (selectedChat !== 'newchat' && newMessage.trim() && inputEnabled) {
      // Disable send button
      // This won't get disabled by the useEffect function until we receive 
      // our own message in confirmation from the backend
      setInputEnabled(false);

      const userMessage = { chatid: selectedChat, message: newMessage.trim() };
      socket.emit("earnings_call_transcript_chat_message", userMessage);
    }
  };

  // Messages are sent as a string but the string represents JSON and needs to be parsed
  socket.on("earnings_call_transcript_chat_message", (message) => {
    //console.log('Received: ' + message);
    message = JSON.parse(message);
    //console.log('Content of messages: ' + messages);
    setMessages(() => [...messages, [
      message.role,
      message.message
    ]]);
  });

  return (
    <div className="chatbot-container">
      <GoogleSignIn login={ login } logOut={ logOut } profile={ profile } className="auth-info-pane"/>
      <ChatSelelectorPane 
        chats={ chats } selectedChat={ selectedChat } 
        handleNewChat={ handleNewChat } handleSelectChat={ handleSelectChat }
      />
      <TickerAndQuarterSelector
        currentTicker={ currentTicker } setCurrentTicker={ setCurrentTicker } 
        currentQuarter={ currentQuarter } setCurrentQuarter={ setCurrentQuarter } 
        selectedChat ={ selectedChat } onStartNewChat={ handleNewChat }
        newChatMessage={ newChatMessage} newChatError={ newChatError }
        newChatWorking={ newChatWorking }
      />
      <div className="message-view-pane">
        <ChatMessages messages={ messages } selectedChat={ selectedChat }/>
        <InputArea inputEnabled={ inputEnabled } handleSendMessage={ handleSendMessage } selectedChat={ selectedChat }/>
      </div>
    </div>
  );
}

export default Chatbot;