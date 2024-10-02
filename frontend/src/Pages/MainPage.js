import React, { useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from '../Images/bg.png';

const MainPage = () => {
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      alert(`You typed: ${text}`);
      setText('');
    }
  };

  const handleVoiceInput = () => {
    alert('Voice input functionality is not implemented yet!');
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'audio/wav') {
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
      alert(`Audio file ${file.name} uploaded successfully!`);
    } else {
      alert('Please upload a valid .wav file.');
    }
  };

  const handleDelete = () => {
    setAudioFile(null);
    setAudioURL('');
    document.getElementById('audio-upload').value = '';
  };

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
    <div className="container-fluid d-flex align-items-stretch vh-100">
      <div
        className="d-flex flex-column justify-content-center align-items-center align-items-md-start p-4 col-lg-4 col-md-6 col-12 text-center text-md-start" // Center the content on small screens
        style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}
      >
        <h1 className="display-4 mb-4 text-dark" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>GestureBridge</h1>

        <div className="d-flex mb-4 flex-wrap justify-content-center justify-content-md-start">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Type something..."
            className="form-control me-2 mb-2"
            style={{ fontSize: '1.2rem', padding: '10px', flexGrow: 1, maxWidth: '300px' }} // Limit width on small screens
          />
          <button
            onClick={handleSend}
            className={`btn btn-success ${text.trim() ? '' : 'disabled'} mb-2`}
            disabled={!text.trim()}
          >
            Send
          </button>
        </div>

        <button onClick={handleVoiceInput} className="btn btn-info mb-4 d-flex align-items-center justify-content-center mx-auto mx-md-0" style={{ padding: '10px', borderRadius: '50px', width: 'max-content' }}>
          <FaMicrophone size={20} className="me-2" />
          Record Voice
        </button>

        <div className="mb-4 w-100">
          <input
            type="file"
            accept=".wav"
            onChange={handleAudioUpload}
            className="form-control"
            id="audio-upload"
          />
        </div>

        {audioFile && (
          <div className="d-flex flex-wrap justify-content-center justify-content-md-start">
            <button onClick={handleSend} className="btn btn-success me-2 mb-2">Send</button>
            <button onClick={handleDelete} className="btn btn-warning me-2 mb-2">Delete</button>
            <button onClick={handlePreview} className="btn btn-info mb-2">Preview</button>
          </div>
        )}
      </div>

      <div
        className="col-lg-8 col-md-6 d-none d-md-block" // Hide the background image on small screens
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
};

export default MainPage;
