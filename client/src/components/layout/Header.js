import React from 'react';
import { Menu, Cpu, Mic, Sparkles } from 'lucide-react';
import { useAgent } from '../../context/AgentContext.js';

export function Header({ onToggleSidebar, onToggleVoiceMode }) {
  const { settings, backendHealth } = useAgent();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-dark-900/60 backdrop-blur-md z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-200 tracking-wide">
            {settings.assistantName || 'Aether'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            v1.0 Local Agent
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Model status indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-dark-950 border border-white/5 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-300">{settings.selectedModel || 'llama3.1:8b'}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${backendHealth.available ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </div>

        {/* Voice Mode Button */}
        <button
          onClick={onToggleVoiceMode}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all text-xs font-mono font-medium"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voice Mode</span>
        </button>
      </div>
    </header>
  );
}
