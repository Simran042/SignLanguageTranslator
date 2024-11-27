import React, { useState, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import bgImage from "../Images/bg.png";
import Modal from "react-bootstrap/Modal"; // Import Bootstrap Modal
import { Button } from "react-bootstrap";

const MainPage = () => {
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [videoURL, setVideoURL] = useState(""); // State to store the video URL
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Function to handle sending the text and audio to the backend
  const handleSend = () => {
    if (text.trim()) {
      alert(text);
    }
    if (audioFile) {
      // Check if there is an audio file
      downloadAudioFile(audioFile);
      const formData = new FormData();
      formData.append("text_input", text);
      if (audioFile) {
        formData.append("audio", audioFile);
      }

      // Send the form data to the Django endpoint
      fetch("http://localhost:8000/process-audio/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert(data.message); // Success message from the backend
          } else {
            console.error("Error:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error processing audio:", error);
        });

      setText(""); // Clear the input
      setAudioFile(null); // Clear the audio file
      setAudioURL(""); // Clear the audio URL
      handleShowVideo();

    }
  };

  // Function to handle voice recording
  const handleVoiceInput = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop(); // Stop recording
      setIsRecording(false);
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.start();
          setIsRecording(true);

          mediaRecorderRef.current.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data); // Save audio data chunks
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            const audioBlobURL = URL.createObjectURL(audioBlob);
            setAudioURL(audioBlobURL);
            setAudioFile(audioBlob);
            audioChunksRef.current = []; // Reset for next recording
          };
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    }
  };

  // Handle uploading an audio file
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "audio/wav") {
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
      alert(`Audio file ${file.name} uploaded successfully!`);
    } else {
      alert("Please upload a valid .wav file.");
    }
  };

  // Delete the uploaded audio file
  const handleDelete = () => {
    setAudioFile(null);
    setAudioURL("");
    document.getElementById("audio-upload").value = "";
  };

  // Function to download and upload the audio file to the backend
  const downloadAudioFile = (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recorded-audio.wav");

    fetch("http://localhost:8000/upload-audio/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // Success message from the backend
        } else {
          console.error("Error:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error uploading audio:", error);
      });
  };

  // Handle showing the video by fetching it from the backend
  const handleShowVideo = () => {
    // Show the modal first to ensure the video element is in the DOM
    setShowModal(true);

    // Fetch the video from the backend
    fetch("http://localhost:8000/get-video/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob(); // Read the response as a blob
      })
      .then((blob) => {
        const videoBlobURL = URL.createObjectURL(blob); // Create a local URL for the video
        setVideoURL(videoBlobURL);
      })
      .catch((error) => {
        console.error("Error fetching video:", error);
      });
  };

  return (
    <div className="container-fluid d-flex align-items-stretch vh-100">
      <div
        className="d-flex flex-column justify-content-center align-items-center align-items-md-start p-4 col-lg-4 col-md-6 col-12 text-center text-md-start"
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)" }}
      >
        <h1
          className="display-4 mb-4 text-dark"
          style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.9)" }}
        >
          GestureBridge
        </h1>

        <div className="d-flex mb-4 flex-wrap justify-content-center justify-content-md-start">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
            className="form-control me-2 mb-2"
            style={{
              fontSize: "1.2rem",
              padding: "10px",
              flexGrow: 1,
              maxWidth: "300px",
            }}
          />
        </div>

        <button
          onClick={handleVoiceInput}
          className="btn btn-info mb-4 d-flex align-items-center justify-content-center mx-auto mx-md-0"
          style={{
            padding: "10px",
            borderRadius: "50px",
            width: "max-content",
          }}
        >
          <FaMicrophone size={20} />
          {isRecording ? "Stop Recording" : "Record Voice"}
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
              Upload
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-warning me-2 mb-2"
            >
              Delete
            </button>
            <div className="audio-preview mt-2">
              <audio controls ref={audioRef} src={audioURL} />
            </div>
          </div>
        )}

        {/* Modal to show the video */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Video Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <video
              width="100%"
              height="auto"
              controls
              src={videoURL} // Use the fetched video URL here
            >
              Your browser does not support the video tag.
            </video>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Button variant="secondary" onClick={handleShowVideo}>
          Show video
        </Button>
      </div>

      <div
        className="col-lg-8 col-md-6 d-none d-md-block"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};

export default MainPage;
