import React, { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa'; // Import a microphone icon from react-icons
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../Styles/MainPage.css'; // Import the CSS file

const MainPage = () => {
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState(null); // State to store the uploaded audio file
  const [audioURL, setAudioURL] = useState(''); // State to store the audio URL for preview
  const [isRecording, setIsRecording] = useState(false); // State to manage recording status
  const mediaRecorderRef = useRef(null); // Ref for MediaRecorder
  const audioChunksRef = useRef([]); // Ref to store audio data chunks
  const audioRef = useRef(null); // Ref for audio element

  // Function to handle when the "Send" button is clicked
  const handleSend = () => {
    if (text.trim() || audioFile) { // Check if there is text or audio
        const formData = new FormData();
        formData.append('text_input', text); // Append the text input to the form data
        if (audioFile) {
            formData.append('audio', audioFile); // Append the audio file if available
        }

        // Send the form data to the Django endpoint
        fetch('http://localhost:8000/process-audio/', {  // Adjust the URL to match your Django endpoint
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
    }
  };


  // Function to handle the voice input button to start/stop recording
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

            // Save the file to a folder (e.g., using backend logic in the future)
            downloadAudioFile(audioBlob);
          };
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    }
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

  // Function to download the audio file
  const downloadAudioFile = (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recorded-audio.wav'); // Append the Blob as 'audio'
  
    // Send the formData to the Django backend
    fetch('http://localhost:8000/upload-audio/', {  // Adjust the URL to match your Django endpoint
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
          {isRecording ? 'Stop Recording' : 'Record Voice'} {/* Voice record button */}
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
            {/* Audio preview element */}
            <div className="audio-preview mt-2">
              <audio controls ref={audioRef} src={audioURL} />
            </div>
          </div>
        )}
      </div>
      <div className="right-column"></div> {/* Background image column */}
    </div>
  );
};

export default MainPage;
