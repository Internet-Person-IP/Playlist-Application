import React from "react";
import './ResponsiveReactPlayer.css'
import ReactPlayer from 'react-player'
/*
I used a package called React Player since it was easy to use and gave a lot 
of funtionality when it came to atleast youtube.

*/
 const ResponsiveReactPlayer = ({url, onEnd, position}) => {
  return (
    <div className='player-wrapper'>
      <ReactPlayer
        playing
        controls
        className='react-player'
        url={url}
        width='100%'
        height='100%'
        onEnded={onEnd}
      />
    </div>
    );
  }

export default ResponsiveReactPlayer;