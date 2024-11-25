import React, { useState, useRef,useEffect } from "react";
import Intro from './Intro'
import MainPage from "./MainPage";

const Start=()=>{
    
    const [isTimedOut,setIsTimedOut]=useState(true);

    useEffect(()=>{
        let timeoutId=setTimeout(()=>{
            setIsTimedOut(true);
        },1000);

        const handleScreenClick = () => {
            clearTimeout(timeoutId);
            setIsTimedOut(false); // Reset the timeout if clicked
          };

          document.addEventListener('click', handleScreenClick);
          return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleScreenClick);
          };
    },[])

    return (
        <>
        <Intro></Intro>
            {/* {
                isTimedOut?(
                    <Intro></Intro>
                ):(
                   <MainPage></MainPage>
                )
            } */}
        </>
    )
}

export default Start
