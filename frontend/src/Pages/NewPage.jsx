import React, { useState, useEffect } from "react";
import AudioPage from "./AudioPage";

const NewPage = () => {
  const [isTimedOut, setIsTimedOut] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Function to check screen width
    const checkScreenSize = () => {
      if (window.innerWidth <= 768) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener to handle window resizing
    window.addEventListener("resize", checkScreenSize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    let timeoutId = setTimeout(() => {
      setIsTimedOut(false);
    }, 100);

    const handleScreenClick = () => {
      clearTimeout(timeoutId);
      setIsTimedOut(false);
    };
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {isSmallScreen ? (
        // On small screens (md or smaller), show AudioPage as the whole page with background color
        <div className="h-screen w-full bg-[#264653]">
          <AudioPage />
        </div>
      ) : (
        // On larger screens, keep the layout with background images and all
        <div
          className={`z-20 w-0 h-screen bg-white transition-all transform ease-in-out duration-1000 text-white ${
            !isTimedOut ? "w-full" : "w-0"
          }`}
        >
          <div className="flex h-screen">
            {/* Left side with background image for larger screens */}
            <div
              className="relative w-1/2 bg-inherit bg-no-repeat bg-cover bg-center blur-[1.5px]"
              style={{
                backgroundImage: "url('./translator_left.png')",
              }}
            >
              <div className="absolute inset-0 bg-teal-800 opacity-50"></div>
            </div>

            {/* Centered Content Section */}
            <div
              className={`absolute inset-0 flex items-center justify-center z-10 transition-all transform duration-1000 ease-in-out ${
                !isTimedOut ? "" : "hidden"
              }`}
            >
              <div className="h-screen w-[45%] bg-[#264653]">
                <AudioPage />
              </div>
            </div>

            {/* Right side with background image for larger screens */}
            <div
              className="relative w-1/2 bg-inherit bg-no-repeat bg-cover bg-center blur-[1.5px]"
              style={{
                backgroundImage: "url('./translator_right.png')", // Path to image in `public` folder
              }}
            >
              <div className="absolute inset-0 bg-teal-800 opacity-50"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewPage;
