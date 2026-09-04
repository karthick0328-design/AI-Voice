import React, { useEffect, useState, Suspense } from 'react';
import { AgentProvider, useAgent } from './context/AgentContext.js';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useProgress } from "@react-three/drei";
import Model from "./Model.js";
import bg from "./assets/real_room.jpg"; // Photorealistic real-world living room background!
import mic from "./assets/mic.png";
import { speechService } from './services/speechService.js';

function Loader() {
  const { progress } = useProgress();
  return <Html center><div className="text-white font-bold">{progress.toFixed(0)} % loaded</div></Html>;
}

const ImmersiveUI = () => {
  const { 
    isListening, 
    startListening, 
    isSpeaking, 
    startSpeaking, 
    currentAnimation, 
    setCurrentAnimation, 
    avatarType, 
    setAvatarType 
  } = useAgent();

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
  }, [startListening]);

  // When avatar is clicked: raises hand, waves, and says hello simultaneously!
  const handleAvatarClick = () => {
    speechService.unlock();
    const greeting = avatarType === "boy" 
      ? "Hi! How can I help you today?" 
      : "Hi! What can I do for you today?";
    startSpeaking(greeting, "hello");
  };

  return (
    <div className='h-screen w-full bg-slate-800 relative overflow-hidden'>
      {/* Real-World Photorealistic Living Room Background */}
      <img
        src={bg}
        className="absolute top-0 left-0 w-full h-full object-cover"
        alt="Real room background"
      />

      {/* Avatar Switcher in Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-1.5 shadow-lg">
        <button
          onClick={() => setAvatarType("boy")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            avatarType === "boy"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>👦</span> Boy Avatar
        </button>
        <button
          onClick={() => setAvatarType("girl")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            avatarType === "girl"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>👧</span> Girl Avatar
        </button>
      </div>

      <Canvas
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <Environment preset="apartment" />
        <ambientLight intensity={2.0} />
        <directionalLight position={[2, 8, 6]} intensity={2.2} />
        <Suspense fallback={<Loader />}>
          <Model 
            key={avatarType} 
            avatarType={avatarType} 
            animation={currentAnimation} 
            onAvatarClick={handleAvatarClick} 
          />
        </Suspense>
      </Canvas>

      <button
        onClick={startListening}
        className='absolute bottom-14 left-1/2 -translate-x-1/2 px-10 py-5 bg-slate-800 text-white font-medium text-lg rounded-3xl flex items-center gap-5 shadow-[0_0_20px_rgba(168,85,247,0.25),0_0_60px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4),0_0_80px_rgba(168,85,247,0.25)] hover:bg-white/10 transition-all duration-300 z-10'
      >
        <div className='bg-white/10 p-3 rounded-2xl'>
          <img src={mic} alt="mic" className='h-6 w-6' />
        </div>

        <span>
          {isListening ? "Listening..." : isSpeaking ? "AI is Speaking..." : "Start Conversation"}
        </span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AgentProvider>
      <ImmersiveUI />
    </AgentProvider>
  );
}
