import React from 'react';
import ReactPlayer from 'react-player';

function VideoPlayer() {
  return (
    <div>
       <ReactPlayer
        url='new_video.mp4' // Electron app can access local files
        playing={true}
        controls={true}
        width='600px'
        height='400px'
      />
    </div>
  );
}

export default VideoPlayer;
