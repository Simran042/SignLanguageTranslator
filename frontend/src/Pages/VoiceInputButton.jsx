import { useState, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";

function VoiceInputButton({handleVoice}) {
  const [isRecording, setIsRecording] = useState(false);
  const [scale, setScale] = useState(1); // Initialize scale to 1
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [microphone, setMicrophone] = useState(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = audioCtx.createAnalyser();
        const microphoneNode = audioCtx.createMediaStreamSource(stream);

        microphoneNode.connect(analyserNode);
        analyserNode.fftSize = 2048; // Set the FFT size for frequency analysis

        setAudioContext(audioCtx);
        setAnalyser(analyserNode);
        setMicrophone(microphoneNode);
      })
      .catch((err) => {
        console.error("Error accessing the microphone:", err);
      });
  };

  const stopRecording = () => {
    if (microphone) {
      microphone.disconnect();
    }

    if (audioContext) {
      audioContext.close();
    }

    // Stop all audio tracks to release the microphone completely
    if (microphone && microphone.mediaStream) {
      microphone.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Reset states
    setAudioContext(null);
    setAnalyser(null);
    setMicrophone(null);
  };

  const handleVoiceInput = () => {
    handleVoice();
    setIsRecording(!isRecording);
  };

  const updateScale = () => {
    if (analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Calculate the loudness from the frequency data
      const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      
      // Map the volume level to a scale value, ensuring it stays within bounds
      const newScale = Math.min(1 + averageVolume / 128, 2); // Max scale of 2
      setScale(newScale);
    }

    // Keep checking the audio levels if recording
    if (isRecording) {
      requestAnimationFrame(updateScale);
    }
  };

  // Start updating the scale once recording begins
  useEffect(() => {
    if (isRecording && analyser) {
      updateScale();
    }
  }, [isRecording, analyser]);

  return (
    <button
      onClick={handleVoiceInput}
      className={`h-24 w-24 bg-black rounded-full transition ease-out duration-100 hover:scale-105`}
      style={{ transform: `scale(${scale})` }} // Dynamically apply scale
    >
      <FaMicrophone size={20} className="w-full h-full p-3" />
    </button>
  );
}

export default VoiceInputButton;
