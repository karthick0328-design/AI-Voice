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
    setAvatarType,
    activeMedia,
    setActiveMedia,
    subtitle
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

  const handleStartListening = () => {
    speechService.unlock();
    startListening();
  };

  return (
    <div className='h-screen w-full bg-slate-800 relative overflow-hidden'>
      {/* Real-World Photorealistic Living Room Background */}
      <img
        src={bg}
        className="absolute top-0 left-0 w-full h-full object-cover"
        alt="Real room background"
      />

      {/* Active YouTube Tab Action Badge */}
      {activeMedia && activeMedia.type === 'youtube' && (
        <div className="absolute top-6 left-6 z-30 flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-red-500/40 px-4 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-red-600/20 p-2 rounded-xl text-red-400 font-bold">
            ▶
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">YouTube Playing</span>
            <span className="text-[11px] text-slate-300 font-mono max-w-[200px] truncate">{activeMedia.title}</span>
          </div>
          <a
            href={activeMedia.directUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl shadow-md transition ml-2 flex items-center gap-1"
          >
            Switch to Tab ↗
          </a>
          <button
            onClick={() => setActiveMedia(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition ml-1"
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Live Subtitle / Status Display */}
      {subtitle && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-lg w-[90%] text-center px-6 py-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-cyan-200 text-sm font-medium shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {subtitle}
        </div>
      )}

      {/* Start Conversation Button */}
      <button
        onClick={handleStartListening}
        className='absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 bg-slate-850 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 text-white font-medium text-lg rounded-3xl flex items-center gap-4 shadow-[0_0_25px_rgba(168,85,247,0.3),0_0_70px_rgba(168,85,247,0.15)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5),0_0_90px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 z-20'
      >
        <div className='bg-purple-600/30 p-2.5 rounded-2xl border border-purple-400/30'>
          <img src={mic} alt="mic" className='h-5 w-5' />
        </div>

        <span className="font-semibold tracking-wide">
          {isListening ? "Listening... Speak now" : isSpeaking ? "Speaking..." : "Start Conversation"}
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
