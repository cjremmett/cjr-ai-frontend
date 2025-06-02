import React from 'react';
import './TickerAndQuarterSelector.css';

function TickerAndQuarterSelector({ currentTicker, setCurrentTicker, currentQuarter, setCurrentQuarter, selectedChat, onStartNewChat, newChatMessage, newChatError, newChatWorking }) {
    // Generate dropdown options
    const generateDropdownOptions = () => {
        const options = [];
        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year >= currentYear - 25; year--) {
            for (let quarter = 4; quarter >= 1; quarter--) {
                options.push(`Q${quarter} ${year}`);
            }
        }

        return options;
    };

    const dropdownOptions = generateDropdownOptions();
    
    // Hide component if not in 'newchat'
    if (selectedChat !== 'newchat') {
        return null;
    }

    return (
      <div className="chat-input-pane-centered">
        <div
          className="selector-placeholder"
          style={{ color: newChatError ? 'red' : '#444' }}
        >
         { newChatMessage }
        </div>
        <div className="selector-row">
          <input
            type="text"
            placeholder="Ticker (e.g., AMZN)"
            value={currentTicker}
            onChange={(e) => setCurrentTicker(e.target.value.toUpperCase())}
          />
          <select
            value={currentQuarter}
            onChange={(e) => setCurrentQuarter(e.target.value)}
          >
            <option value="">Year & Quarter</option>
            {dropdownOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`start-new-chat-btn ${newChatWorking ? 'disabled' : ''}`}
          onClick={onStartNewChat}
          type="button"
          disabled={newChatWorking}
        >
          {newChatWorking ? 'Creating new chat...' : 'Start New Chat'}
        </button>
      </div>
    );
}

export default TickerAndQuarterSelector;