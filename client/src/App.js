import React, { useEffect, useState, Suspense } from 'react';
import { AgentProvider, useAgent } from './context/AgentContext.js';
import { Canvas } from "@react-three/fiber";
import { Environment, Html, useProgress } from "@react-three/drei";
import Model from "./Model.js";
import bg from "./assets/real_room.jpg";
import mic from "./assets/mic.png";
import YouTubePlayer from "./components/media/YouTubePlayer.js";
import { speechService } from './services/speechService.js';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-purple-500/30 text-white font-semibold text-sm">
        {progress.toFixed(0)}% loaded
      </div>
    </Html>
  );
}

const QUICK_ACTIONS = [
  { label: "👋 Say Hi", query: "Hi! How are you?" },
  { label: "🎵 Play Music", query: "Play a Kalyani song on YouTube" },
  { label: "⏰ What Time is it?", query: "What time is it now?" },
  { label: "😂 Tell a Joke", query: "Tell me a funny joke" },
  { label: "💡 Who are you?", query: "Who are you and what can you do?" }
];

const ImmersiveUI = () => {
  const { 
    isListening, 
    startListening, 
    isSpeaking, 
    startSpeaking, 
    currentAnimation, 
    avatarType, 
    setAvatarType,
    activeMedia, 
    setActiveMedia,
    lastAction,
    subtitle,
    aiText,
    handleQuery
  } = useAgent();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        speechService.unlock();
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
      ? "Hi! I am Alex. How can I help you today?" 
      : "Hi! I am Nova. What would you like to do today?";
    startSpeaking(greeting, "hello");
  };

  const handleStartListening = () => {
    speechService.unlock();
    startListening();
  };

  const handleQuickAction = (q) => {
    speechService.unlock();
    handleQuery(q);
  };

  return (
    <div className='h-screen w-full bg-slate-900 relative overflow-hidden flex flex-col justify-between select-none'>
      {/* Real-World Photorealistic Living Room Background */}
      <img
        src={bg}
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        alt="Real room background"
      />

      {/* Top Header Bar: Avatar Switcher & Status */}
      <div className="relative z-30 w-full px-4 pt-4 sm:px-6 sm:pt-6 flex items-center justify-between pointer-events-none">
        {/* Brand Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-purple-500/30 px-3 py-1.5 rounded-2xl shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
            AETHER AI
          </span>
        </div>

        {/* Boy / Girl Switcher */}
        <div className="pointer-events-auto flex items-center bg-slate-900/85 backdrop-blur-md border border-purple-500/40 rounded-2xl p-1 shadow-xl">
          <button
            onClick={() => { speechService.unlock(); setAvatarType("boy"); }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              avatarType === "boy"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>👦</span> Boy Avatar
          </button>
          <button
            onClick={() => { speechService.unlock(); setAvatarType("girl"); }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              avatarType === "girl"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>👧</span> Girl Avatar
          </button>
        </div>
      </div>

      {/* Embedded Live YouTube Video Player (in-room TV/Media Player) */}
      {activeMedia && activeMedia.type === 'youtube' && (
        <YouTubePlayer
          media={activeMedia}
          lastAction={lastAction}
          onClose={() => setActiveMedia(null)}
        />
      )}

      {/* 3D Canvas with Realistic Lighting & Camera */}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
          zIndex: 10
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

      {/* Bottom Interactive Area */}
      <div className="relative z-30 w-full px-4 pb-6 sm:pb-8 flex flex-col items-center gap-3">
        {/* Live Subtitle / AI Speech Bubble */}
        {(subtitle || aiText) && (
          <div className="max-w-xl w-full text-center px-5 py-3 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-purple-500/40 text-slate-100 text-xs sm:text-sm font-medium shadow-2xl animate-in fade-in duration-200">
            {subtitle && <p className="text-purple-300 font-semibold mb-0.5">{subtitle}</p>}
            {aiText && isSpeaking && <p className="text-slate-200">{aiText}</p>}
          </div>
        )}

        {/* Quick Action Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
          {QUICK_ACTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(item.query)}
              className="flex-shrink-0 text-xs sm:text-sm font-medium px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-md hover:bg-purple-600/30 border border-slate-700/60 hover:border-purple-400 text-slate-200 hover:text-white rounded-full transition duration-200 shadow-md active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Microphone / Start Conversation Button */}
        <button
          onClick={handleStartListening}
          className={`px-8 py-3.5 sm:px-10 sm:py-4 bg-slate-900/90 backdrop-blur-md border rounded-3xl flex items-center gap-3.5 shadow-2xl transition-all duration-300 active:scale-95 ${
            isListening 
              ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse" 
              : isSpeaking
              ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
              : "border-purple-500/40 hover:border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:scale-105"
          }`}
        >
          <div className={`p-2 rounded-2xl border ${
            isListening ? "bg-red-600/30 border-red-400/40" : "bg-purple-600/30 border-purple-400/30"
          }`}>
            <img src={mic} alt="mic" className='h-5 w-5' />
          </div>

          <span className="text-white font-bold text-sm sm:text-base tracking-wide">
            {isListening ? "Listening... Speak now" : isSpeaking ? "AI Speaking..." : "Start Conversation"}
          </span>
        </button>

        {/* Instruction Note */}
        <p className="text-[11px] text-slate-400/90 text-center">
          Tap 3D Avatar to wave & speak • Ask "Play [song]" to watch YouTube right here
        </p>
      </div>
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
