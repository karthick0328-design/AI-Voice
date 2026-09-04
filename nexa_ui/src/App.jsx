import React, { useContext, useEffect, useState } from 'react'
import aiImg from './assets/Ai-assistant.jpg'
import mic from './assets/mic.png'
import back from './assets/back.png'
import { myContext } from './context/useContext'
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import bg from "./assets/one.png"


const App = () => {
  const { listening, startListening, speaking, startSpeaking ,currentAnimation,setCurrentAnimation } = useContext(myContext);


useEffect(() => {
  if (!speaking && !listening) {
    startListening();
  }
}, [speaking, listening]);
  
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.code === "Space") {
      window.speechSynthesis.cancel();
      startListening();
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []);

  return (
    <>
      <div className='h-screen w-full bg-slate-800'>
       <img
  src={bg}
  className="absolute top-0 left-0 w-full h-full object-cover"
 />

     <Canvas
  gl={{ alpha: true }}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    background: "transparent",
  }}
>
        <Environment preset="studio" />

        <Model animation ={currentAnimation}/>
      </Canvas>


<button
  onClick={startListening}
  className='absolute  bottom-14 left-1/2 -translate-x-1/2 px-10 py-5 bg-slate-800 text-white font-medium text-lg rounded-3xl flex items-center gap-5 shadow-[0_0_20px_rgba(168,85,247,0.25),0_0_60px_rgba(168,85,247,0.15)]  hover:shadow-[0_0_30px_rgba(168,85,247,0.4),0_0_80px_rgba(168,85,247,0.25)] hover:bg-white/10 transition-all duration-300'
>
  <div className='bg-white/10 p-3 rounded-2xl'>
    <img src={mic} alt="mic"
      className='h-6 w-6'/>
  </div>

  <span>
    {listening ?"Listening...": speaking? "AI is Speaking...": "Start Conversation"} </span>
   </button>

      </div>
    </>
  )
}

export default App