import React from 'react';
import { AvatarCanvas } from '../avatar/AvatarCanvas.js';
import { Volume2, Sliders, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { useAgent } from '../../context/AgentContext.js';

export function RightPanel() {
  const { aiState, statusText, settings, updateSettingsState, activeTools, backendHealth } = useAgent();

  const handleSpeedChange = (e) => {
    updateSettingsState({ speechSpeed: parseFloat(e.target.value) });
  };

  const handleAutoSpeakToggle = () => {
    updateSettingsState({ autoSpeak: !settings.autoSpeak });
  };

  return (
    <aside className="hidden xl:flex flex-col w-84 bg-dark-900 border-l border-white/5 p-4 space-y-4 overflow-y-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200">AI TELEMETRY</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${backendHealth.available ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
          <span className="text-[10px] font-mono text-slate-400">
            {backendHealth.available ? 'ONLINE' : 'ADAPTIVE'}
          </span>
        </div>
      </div>

      {/* 3D Interactive AI Avatar Canvas */}
      <div className="w-full h-72">
        <AvatarCanvas className="w-full h-full" />
      </div>

      {/* Assistant Persona Card */}
      <div className="glass-card rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">COMPANION:</span>
          <span className="text-cyan-300 font-semibold">{settings.assistantName}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">PERSONA:</span>
          <span className="text-slate-300">{settings.personality}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">LLM MODEL:</span>
          <span className="text-purple-400 font-semibold">{settings.selectedModel || 'llama3.1:8b'}</span>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="glass-card rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>VOICE CONTROLS</span>
          </div>
          <button
            onClick={handleAutoSpeakToggle}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
              settings.autoSpeak
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-dark-950 text-slate-500 border border-white/5'
            }`}
          >
            Auto-Speak: {settings.autoSpeak ? 'ON' : 'OFF'}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>Speech Speed</span>
            <span>{settings.speechSpeed || 1.0}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={settings.speechSpeed || 1.0}
            onChange={handleSpeedChange}
            className="w-full accent-cyan-400 bg-dark-950 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Security & Tool Permissions */}
      <div className="glass-card rounded-xl p-3.5 space-y-2 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SECURITY POLICY</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Browser Tool:</span>
            <span className="text-amber-400">Confirmation Required</span>
          </div>
          <div className="flex justify-between">
            <span>Web Search:</span>
            <span className="text-emerald-400">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Memory Engine:</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
