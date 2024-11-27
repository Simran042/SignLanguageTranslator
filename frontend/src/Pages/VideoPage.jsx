import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router";

const VideoPage = () => {
  const navigate = useNavigate();

  const [words, setWords] = useState([]); // Words from the sentence
  const [durations, setDurations] = useState([]); // Durations from the duration array
  const [ner, setNer] = useState([]); // NER array
  const [descriptions, setDescriptions] = useState([]); // Descriptions array

  const [currentWordIndex, setCurrentWordIndex] = useState(null); // Track current highlighted word
  const [selectedDescription, setSelectedDescription] = useState(null); // Description to display on click

  // Fetch data from data.json
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Process data
        setWords(data.sentence.split(" "));
        setDurations(data.duration);
        setNer(data.ner);
        setDescriptions(data.description);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle word highlighting
  const handleWordHighlight = (currentTime) => {
    let accumulatedTime = 0;
    let highlightedIndex = null;

    for (let i = 0; i < durations.length; i++) {
      accumulatedTime += durations[i];
      if (currentTime <= accumulatedTime) {
        highlightedIndex = i;
        break;
      }
    }

    setCurrentWordIndex(highlightedIndex);
  };

  // Handle word click to show description
  const handleWordClick = (word) => {
    const nerIndex = ner.indexOf(word); // Check if the word is in NER
    if (nerIndex !== -1 && descriptions[nerIndex]) {
      setSelectedDescription(descriptions[nerIndex]);
    }
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
      <div className="text-center">
        {words.length > 0 ? (
          <h1 style={{ color: "white", fontSize: "2rem" }}>
            {words.map((word, index) => (
              <span
                key={index}
                style={{
                  color: index === currentWordIndex ? "yellow" : "white", // Highlight current word
                  marginRight: "0.5rem",
                  cursor: ner.includes(word) ? "pointer" : "default", // Make clickable if in NER
                  textDecoration: ner.includes(word) ? "underline" : "none", // Add underline for NER words
                }}
                onClick={() => handleWordClick(word)} // Show description on click
              >
                {word}
              </span>
            ))}
          </h1>
        ) : (
          <p style={{ color: "white" }}>Loading words...</p>
        )}
      </div>

      {/* Display the description for clicked NER word */}
      {selectedDescription && (
        <div className="bg-white text-black p-4 mt-4 rounded shadow-lg max-w-xl text-center">
          <p>{selectedDescription}</p>
          <button
            onClick={() => setSelectedDescription(null)} // Clear description on close
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
