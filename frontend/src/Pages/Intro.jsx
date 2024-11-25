import React, { useState,useEffect, useRef } from "react";
import MainPage from "./MainPage";
import NewPage from "./NewPage";

const Intro=()=>{


    const [show, setShow] = useState(false);
    const [isTimedOut,setIsTimedOut]=useState(false);

    useEffect(()=>{
        let timeoutId=setTimeout(()=>{
            setIsTimedOut(true);
        },5000);

        
        const handleScreenClick = () => {
            clearTimeout(timeoutId);
            setIsTimedOut(true); // Reset the timeout if clicked
          };

          document.addEventListener('click', handleScreenClick);
          return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleScreenClick);
          };
          console.log(timeoutId);
    },[])

    useEffect(() => {
      // Trigger the transition when the component mounts
      let timeoutid=setTimeout(()=>{

          setShow(true);
      },1000)
      return () => {
        clearTimeout(timeoutid);
      };
    }, []);

    return(
        <>
         <div className="h-screen w-screen flex justify-center items-center">
            {isTimedOut&&(
               <div className="z-20 overflow-hidden">
            <div className="w-screen h-screen flex justify-center items-center border-x-8 border-black shadow-2xl">
                 <NewPage />
            </div>
             </div>
            )
            
            }
        <div className="w-[100%] h-[100%] bg-black absolute"></div>
         <div className="w-[90%] h-[90%] rounded-3xl bg-[#1E3B42] blur-3xl absolute"></div>
            <div className="w-[50%] h-[60%] rounded-3xl bg-[#142F2D] blur-3xl absolute"></div>
           
                   {!isTimedOut&& <div>
                        <div
                        className={`flex m-auto w-fit my-auto flex-col text-center items-center transition-all transform duration-1000 ease-out ${
                        show ? 'opacity-100 scale-125' : 'opacity-0 scale-50'
                        }`}
                        >
                            <h1 className="text-gray-300 glowing-text font-bold ">GESTURE BRIDGE</h1>
                            <p className="text-gray-300 text-3xl glowing-text font-bold ">BRIDGING COMMUNTICATION WITH SIGN LANGUAGE</p>
                            <p className="w-[75%] glowing-text text-gray-400 text-2xl font-bold">Whether you're looking to convert audio messages or written content into sign language, our user-friendly tools provide fast and accurate translations. </p>
                        </div>
                    </div>}
         </div>
        </>
    )
}

export default Intro;
