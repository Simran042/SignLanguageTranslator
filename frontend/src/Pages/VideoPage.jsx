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
  const [selectedWordIndex, setSelectedWordIndex] = useState(null); // Index of the clicked word
  const [videoDuration, setVideoDuration] = useState(0); // Store total video duration

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

  // Get video duration
  const handleVideoDuration = (duration) => {
    setVideoDuration(duration);
  };

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
  const handleWordClick = (word, index) => {
    const nerIndex = ner.indexOf(word); // Check if the word is in NER
    if (nerIndex !== -1 && descriptions[nerIndex]) {
      setSelectedDescription(descriptions[nerIndex]);
      setSelectedWordIndex(index); // Track the clicked word index
    }
  };

  // Close the modal
  const closeModal = () => {
    setSelectedDescription(null);
    setSelectedWordIndex(null);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex justify-between items-center flex-col">
      {/* Video Section */}
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
          onDuration={handleVideoDuration} // Get video duration
        />
      </div>

      {/* Caption Block */}
      <div
        className="w-full flex justify-center items-center relative bg-black bg-opacity-80 text-center text-white p-4 mt-4"
        style={{
          fontSize: "1.25rem",
          overflowX: "auto", // Allow horizontal scroll
          maxWidth: "100%", // Full width of the screen
          whiteSpace: "nowrap", // Keep the words in one line
          scrollbarWidth: "none", // Hide scrollbar for Firefox
          WebkitOverflowScrolling: "touch", // Smooth scrolling for iOS
        }}
      >
        {/* Dynamic text scroll */}
        <div
          className="caption-text"
          style={{
            display: "inline-block",
            position: "relative",
            left: "0",
            overflowX: "scroll", // Enable horizontal scroll
            width: "100%", // Full width of the screen
            scrollBehavior: "smooth", // Smooth scrolling effect
            scrollbarWidth: "none", // Hide scrollbar in Firefox
            WebkitOverflowScrolling: "touch", // For iOS scrolling
          }}
          ref={(el) => {
            if (el && currentWordIndex !== null) {
              const wordElement = el.children[currentWordIndex];
              if (wordElement) {
                el.scrollLeft = wordElement.offsetLeft - el.offsetWidth / 2 + wordElement.offsetWidth / 2;
              }
            }
          }}
        >
          {words.length > 0 ? (
            words.map((word, index) => (
              <span
                key={index}
                style={{
                  color:
                    index === currentWordIndex
                      ? "yellow"
                      : index === selectedWordIndex
                      ? "red" // Highlight clicked word
                      : "white",
                  marginRight: "0.5rem",
                  cursor: ner.includes(word) ? "pointer" : "default", // Make clickable if in NER
                  textDecoration: ner.includes(word) ? "underline" : "none", // Add underline for NER words
                }}
                onClick={() => handleWordClick(word, index)} // Show description on click
              >
                {word}
              </span>
            ))
          ) : (
            <p>Loading captions...</p>
          )}
        </div>
      </div>

      {/* Modal for NER Word Description */}
      {selectedDescription && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white text-black p-6 rounded shadow-lg max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            <p>{selectedDescription}</p>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
