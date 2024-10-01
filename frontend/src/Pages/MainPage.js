import React, { useState } from 'react';
import { FaMicrophone } from 'react-icons/fa'; // Import a microphone icon from react-icons
import '../Styles/MainPage.css'; // Import the CSS file

const MainPage = () => {
  const [text, setText] = useState('');

  // Function to handle when the "Send" button is clicked
  const handleSend = () => {
    if (text.trim()) {
      alert(`You typed: ${text}`);
      setText(''); // Clear the input after sending
    }
  };

  // Function to handle the voice input button (future integration)
  const handleVoiceInput = () => {
    alert('Voice input functionality is not implemented yet!');
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="container">
      <h1 className="heading">GestureBridge</h1> {/* Page Heading */}

      <div className="input-container">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type something..."
          className="input-box"
        />

        <button
          onClick={handleSend}
          className={text.trim() ? "send-button" : "disabled-send-button"}
          disabled={!text.trim()} // Disable button when no text
        >
          Send {/* Send button */}
        </button>
      </div>

      <button onClick={handleVoiceInput} className="voice-button">
        <FaMicrophone size={20} />
        Record Voice {/* Voice record button */}
      </button>
    </div>
  );
};

export default MainPage;
