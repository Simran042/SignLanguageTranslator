import React, { useState, useRef,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import bgImage from "../Images/bg.png";
import Modal from "react-bootstrap/Modal"; // Import Bootstrap Modal
import { Button } from "react-bootstrap";
import VoiceInputButton from "./VoiceInputButton";
import VideoPage from "./VideoPage";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';

const AudioPage = () => {
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [videoURL, setVideoURL] = useState(""); // State to store the video URL
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const [loading,setLoading]=useState(false)
  const [progress,setProgress]=useState(0)
 
  const navigate = useNavigate();
    // Send the form data to the Django endpoint
  const handleSend =async (e) => {
    e.preventDefault();
    setLoading(true)
  const formData = new FormData();
  formData.append("text_input", text);
  console.log(text)
  if (audioFile) {
    await downloadAudioFile(e,audioFile);
    formData.append("audio", audioFile);
  }

    // Send the form data to the Django endpoint
    try {
      console.log("Starting fetch...");
      const response = await fetch("http://localhost:8000/process-audio/", {
        method: "POST",
        body: formData,
      });
      
      
      const data = await response.json();
      // console.log("Response parsed:", data);
    
      if (data.message) {
        alert(data.message);
        setLoading(false)
        // navigate('/video')
        // setShowModal(true);
        // e.preventDefault()
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    }
    setText(""); // Clear the input
    setAudioFile(null); // Clear the audio file
    setAudioURL("");
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
    e.preventDefault()
    const file = e.target.files[0];

    if (file && file.type === "audio/wav") {
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
      // alert(`Audio file ${file.name} uploaded successfully!`);
    } else {
      // alert("Please upload a valid .wav file.");
    }
  };

  // Delete the uploaded audio file
  const handleDelete = () => {
    setAudioFile(null);
    setAudioURL("");
    document.getElementById("audio-upload").value = "";
  };

  // Function to download and upload the audio file to the backend
  const downloadAudioFile = async(e,audioBlob) => {
    e.preventDefault()
    
    const formData = new FormData();

    formData.append("audio", audioBlob, "recorded-audio.wav");

    await fetch("http://localhost:8000/upload-audio/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          // alert(data.message); // Success message from the backend
        } else {
          console.error("Error:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error uploading audio:", error);
      });

     setVideoURL("");
  };

  const percentage = 100;

  return (
   
    <>
      { loading?(
        <div className="w-screen h-screen bg-gray-700 fixed top-0 left-0">
            <div className="w-full h-full m-auto flex justify-center items-center self-center">
            <div className="w-32 h-32 border-l-8 border-gray-200 border-t-green-800 rounded-full animate-spin"></div>

          </div>
        </div>
      ):  (
        <>
          <div className="h-screen w-full border-2 border-teal-950 shadow-md shadow-black flex justify-center items-center">
      <div
        className="h-full w-full flex justify-around items-center flex-col p-5 "
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)" }}
      >

        <div className="text-center h-[20%] ">
        <h1 style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.9)" }}>GESTURE BRIDGE</h1>
        <h4 style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.9)" }}> Record, Type and Upload Videos </h4>

        </div>

      
      <div className="flex flex-col text-center justify-center h[40%]">
        <VoiceInputButton handleVoice={handleVoiceInput}
        />
        <p className="my-3 text-md font-bold text-gray-300 ">{isRecording ? "Stop " : "Record Voice"} </p>

      </div>

        <div className="h-[10%]  w-full">
        {audioFile && (
            
          <div className="flex justify-around w-full items-center ">
            <div className="audio-preview mt-2">
              <audio controls ref={audioRef} src={audioURL} />
            </div>
            <button type="button" onClick={handleSend} className="bg-green-900 w-[15%] p-[0.7rem] rounded-[2rem] hover:scale-105 hover:bg-green-800">
              Send
            </button>
            <button
            type="button" 
              onClick={handleDelete}
              className="bg-red-900 w-[15%] p-[0.7rem] rounded-[2rem] hover:scale-105 hover:bg-red-800"
            >
              Delete
            </button>
            
          </div>
        )}

        </div>

        <div className="m-[10%] w-full flex justify-between space-x-4 h-[8%] ">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
            className="form-control w-[80%] bg-gray-700"
            style={{
              fontSize: "1.2rem",
              padding: "10px",
              flexGrow: 1,
              backgroundColor:'#D3D3D3',
              width: '50%',
              
            }}
          />
          <button type="button" className=" text-white py-3 px-6 rounded-[3rem] text-sm font-semibold transition transform hover:scale-105 bg-teal-950 hover:bg-green-800 hover:shadow-sm hover:shadow-black" onClick={handleSend}>
        Play Video
        </button>
        </div>

        <div className="mb-4 w-100">
          <input
            type="file"
            accept=".wav"
            onChange={handleAudioUpload}
            className="form-control"
            id="audio-upload"
          />
        </div>

        

        {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Video Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body> */}
            {/* Video element displaying the video from the public folder */}
            {/* <video
              width="100%"
              height="auto"
              controls
              src="fixed_video.mp4" // Reference the video using relative path
            >
              Your browser does not support the video tag.
            </video> */}
          {/* </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal> */}

        {/* Modal to show the video */}
        <Button type="button" variant="secondary" onClick={()=>setShowModal(true)} className="  mb-28" >
          Show video
        </Button>
      </div>

      
    </div>
        </>
      )}
    </> 
  
  );
};

export default AudioPage;
