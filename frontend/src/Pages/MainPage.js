import React, { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa'; // Import a microphone icon from react-icons
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import bgImage from '../Images/bg.png';

const MainPage = () => {
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState(null); // State to store the uploaded audio file
  const [audioURL, setAudioURL] = useState(''); // State to store the audio URL for preview
  const [isRecording, setIsRecording] = useState(false); // State to manage recording status
  const mediaRecorderRef = useRef(null); // Ref for MediaRecorder
  const audioChunksRef = useRef([]); // Ref to store audio data chunks
  const audioRef = useRef(null); // Ref for audio element

  const handleSend = () => {
    if(text.trim()){
      alert(text);
    }
    if (audioFile) { // Check if there is text or audio
      downloadAudioFile(audioFile);
      const formData = new FormData();
      formData.append('text_input', text); // Append the text input to the form data
      if (audioFile) {
        formData.append('audio', audioFile); // Append the audio file if available
      }

      // Send the form data to the Django endpoint
      fetch('http://localhost:8000/process-audio/', { // Adjust the URL to match your Django endpoint
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert(data.message); // Success message from the backend
        } else {
          console.error('Error:', data.error);
        }
      })
      .catch(error => {
        console.error('Error processing audio:', error);
      });

      setText(''); // Clear the input after sending
      setAudioFile(null); // Clear the audio file after sending
      setAudioURL(''); // Clear the audio URL after sending

      if (text.trim()) {
        alert(`You typed: ${text}`);
        setText('');
      }
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.start();
          setIsRecording(true);

          // Push the audio data chunks
          mediaRecorderRef.current.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
          };

          // When recording is stopped, create a Blob and save it as a .wav file
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(audioBlob);
            setAudioURL(audioURL);
            setAudioFile(audioBlob);

            // Reset the chunks for the next recording
            audioChunksRef.current = [];
          };
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    }
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

  // Function to download the audio file
  const downloadAudioFile = (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recorded-audio.wav'); // Append the Blob as 'audio'

    // Send the formData to the Django backend
    fetch('http://localhost:8000/upload-audio/', { // Adjust the URL to match your Django endpoint
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert(data.message); // Success message from the backend
      } else {
        console.error('Error:', data.error);
      }
    })
    .catch(error => {
      console.error('Error uploading audio:', error);
    });
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
          <FaMicrophone size={20} />
          {isRecording ? 'Stop Recording' : 'Record Voice'} {/* Voice record button */}
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
            <button onClick={handleSend} className="btn btn-success me-2 mb-2">
              Send {/* Send button */}
            </button>
            <button onClick={handleDelete} className="btn btn-warning me-2 mb-2">
              Delete {/* Delete button */}
            </button>
            {/* Audio preview element */}
            <div className="audio-preview mt-2">
              <audio controls ref={audioRef} src={audioURL} />
            </div>
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
