import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CyberCompanion } from './CyberCompanion.js';
import { useAgent } from '../../context/AgentContext.js';

export function AvatarCanvas({ className = '' }) {
  const { aiState, statusText } = useAgent();

  const stateBadges = {
    IDLE: { label: 'IDLE', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    LISTENING: { label: 'LISTENING', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30 animate-pulse' },
    THINKING: { label: 'THINKING', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse' },
    SEARCHING: { label: 'SEARCHING WEB', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30 animate-pulse' },
    EXECUTING: { label: 'EXECUTING TOOL', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' },
    SPEAKING: { label: 'SPEAKING', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse' },
    SUCCESS: { label: 'SUCCESS', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    ERROR: { label: 'ERROR', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
  };

  const badge = stateBadges[aiState] || stateBadges.IDLE;

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl glass-panel ${className}`}>
      {/* State indicator overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <span className={`px-2.5 py-1 text-xs font-mono font-semibold tracking-wider rounded-full border ${badge.color}`}>
          ● {badge.label}
        </span>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full min-h-[260px]">
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.0} />
          <pointLight position={[-4, -4, -2]} color="#00f0ff" intensity={0.8} />

          <Suspense fallback={null}>
            <CyberCompanion aiState={aiState} />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.5}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Bottom status text */}
      <div className="absolute bottom-3 left-4 right-4 z-10 text-center">
        <p className="text-xs text-slate-400 truncate font-mono bg-dark-900/60 px-3 py-1 rounded-full border border-white/5">
          {statusText}
        </p>
      </div>
    </div>
  );
}
