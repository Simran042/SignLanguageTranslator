import React, { useState } from 'react';
import { FaMicrophone } from 'react-icons/fa'; // Import a microphone icon from react-icons
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../Styles/MainPage.css'; // Import the CSS file

const MainPage = () => {
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState(null); // State to store the uploaded audio file
  const [audioURL, setAudioURL] = useState(''); // State to store the audio URL for preview

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

  // Function to handle audio file upload
  const handleAudioUpload = (e) => {
    const file = e.target.files[0]; // Get the first file
    if (file && file.type === 'audio/wav') {
      setAudioFile(file); // Store the audio file in state
      setAudioURL(URL.createObjectURL(file)); // Create a URL for the audio file for preview
      alert(`Audio file ${file.name} uploaded successfully!`);
    } else {
      alert('Please upload a valid .wav file.'); // Alert for invalid file type
    }
  };


  // Function to handle delete action
  const handleDelete = () => {
    setAudioFile(null);
    setAudioURL('');
    document.getElementById('audio-upload').value = ''; // Reset file input
  };

  // Function to handle audio preview
  const handlePreview = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="container">
      <div className="left-column">
        <h1 className="heading">GestureBridge</h1> {/* Page Heading */}

        <div className="input-container mb-4">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Type something..."
            className="input-box form-control"
          />

          <button
            onClick={handleSend}
            className={`send-button btn btn-success me-2 ${text.trim() ? '' : 'disabled'}`}
            disabled={!text.trim()} // Disable button when no text
          >
            Send {/* Send button */}
          </button>
        </div>

        <button onClick={handleVoiceInput} className="voice-button btn btn-info mb-4">
          <FaMicrophone size={20} />
          Record Voice {/* Voice record button */}
        </button>

        {/* File upload button */}
        <div className="upload-container">
          <input
            type="file"
            accept=".wav" // Accept only .wav files
            onChange={handleAudioUpload}
            className="file-input form-control"
            id="audio-upload" // Add ID for the file input
          />
        </div>

        {/* Conditional rendering of action buttons based on file upload */}
        {audioFile && (
          <div className="action-buttons mt-4">
            <button onClick={handleSend} className="send-button btn btn-success me-2">
              Send {/* Send button */}
            </button>
            <button onClick={handleDelete} className="btn btn-warning me-2">
              Delete {/* Delete button */}
            </button>
            <button onClick={handlePreview} className="btn btn-info">
              Preview {/* Preview button */}
            </button>
          </div>
        )}
      </div>
      <div className="right-column"></div> {/* Background image column */}
    </div>
  );
};

export default MainPage;
