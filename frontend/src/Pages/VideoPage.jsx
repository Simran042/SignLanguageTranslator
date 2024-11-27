import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router";

const VideoPage = () => {
  const navigate = useNavigate();

  // State to store word-duration pairs fetched from JSON
  const [wordDurationPairs, setWordDurationPairs] = useState([]);

  // State to track the current highlighted word
  const [currentWord, setCurrentWord] = useState("");

  // Fetch data from the word_duration.json file
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Correcting the file path to public directory
        const response = await fetch("/word_duration.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWordDurationPairs(data);
      } catch (error) {
        console.error("Error fetching word-duration pairs:", error);
      }
    };

    fetchData();
  }, []);

  // Function to handle word highlighting
  const handleWordHighlight = (currentTime) => {
    let highlightedWord = "";
    let accumulatedTime = 0;

    for (const { word, duration } of wordDurationPairs) {
      accumulatedTime += duration;
      if (currentTime <= accumulatedTime) {
        highlightedWord = word;
        break;
      }
    }

    setCurrentWord(highlightedWord);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex justify-between items-center flex-col">
      <div className="w-screen p-10">
        <button
          onClick={() => navigate("/audio")}
          className="flex items-center justify-center w-12 h-12 bg-transparent text-white border-4 border-white rounded-full shadow-md hover:shadow-lg transition-transform duration-100 transform hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-6 h-6"
          >
            <line x1="19" y1="12" x2="5" y2="12" stroke="white" strokeLinecap="round" />
            <polyline
              points="12 5 5 12 12 19"
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

    
      <div>
        <ReactPlayer
          url="fixed_video.mp4"
          playing={true}
          controls={true}
          width="600px"
          height="400px"
          onProgress={({ playedSeconds }) => handleWordHighlight(playedSeconds)}
        />
      </div>

      {/* Display the highlighted text */}
      <div>
        {wordDurationPairs.length > 0 ? (
          <h1 style={{ color: "white", fontSize: "2rem" }}>
            {wordDurationPairs.map(({ word }) => (
              <span
                key={word}
                style={{
                  color: word === currentWord ? "yellow" : "white",
                  marginRight: "0.5rem",
                }}
              >
                {word}
              </span>
            ))}
          </h1>
        ) : (
          <p style={{ color: "white" }}>Loading words...</p>
        )}
      </div>
        <div></div>
        <div></div>
    </div>
  );
};

export default VideoPage;
