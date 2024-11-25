import React, { useState, useRef } from "react";
import ReactPlayer from 'react-player';
import { useNavigate } from "react-router";
const VideoPage=()=>{

    const navigate=useNavigate();

    return(
        <div className="w-screen h-screen bg-gray-900 flex justify-between items-center flex-col">
            <div className="w-screen p-10">
            <button
         onClick={()=>navigate('/audio')}
      className="flex items-center justify-center w-12 h-12 bg-transparent text-white border-4  border-white rounded-full shadow-md hover:shadow-lg transition-transform duration-100 transform hover:scale-110"
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
        <polyline points="12 5 5 12 12 19" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
            </div>
            <div>
                ` <ReactPlayer
                    url='fixed_video.mp4' // Electron app can access local files
                    playing={true}
                    controls={true}
                    width='600px'
                    height='400px'
                />`
            </div>
        </div>
    )
}

export default VideoPage
