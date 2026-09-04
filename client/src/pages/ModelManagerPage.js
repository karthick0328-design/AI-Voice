import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertCircle, RefreshCw, Download, Terminal, HardDrive } from 'lucide-react';
import { apiService } from '../services/api.js';
import { useAgent } from '../context/AgentContext.js';

export function ModelManagerPage() {
  const { settings, updateSettingsState } = useAgent();
  const [models, setModels] = useState([]);
  const [health, setHealth] = useState({ available: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkModels();
  }, []);

  const checkModels = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getModels();
      setModels(res.data.models || []);
      setHealth(res.data.health || { available: false });
    } catch (err) {
      console.error('Check models error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectModel = (modelId) => {
    updateSettingsState({ selectedModel: modelId });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>LOCAL INFERENCE ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Model Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect installed local LLM weights, select active reasoning model, and monitor Ollama service.
          </p>
        </div>

        <button
          onClick={checkModels}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-mono transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Models</span>
        </button>
      </div>

      {/* Ollama Status Alert */}
      <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
        health.available
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}>
        {health.available ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-sm">
            {health.available ? 'Ollama Service Connected' : 'Ollama Offline / In Adaptive Fallback Mode'}
          </p>
          <p className="text-slate-300 leading-relaxed">
            {health.available
              ? 'Local LLM server is active on http://127.0.0.1:11434. Models can stream responses natively.'
              : 'To enable full local Llama 3.1 inference on your machine, download Ollama from ollama.com and run `ollama run llama3.1:8b` in your terminal.'}
          </p>
        </div>
      </div>

      {/* Setup Guide Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Terminal className="w-4 h-4" />
          <span>QUICK START COMMANDS (OLLAMA SETUP)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-dark-950 border border-white/5 space-y-1">
            <span className="text-slate-400">1. Pull recommended Llama 3.1:</span>
            <pre className="text-cyan-300 select-all">ollama run llama3.1:8b</pre>
          </div>
          <div className="p-3 rounded-xl bg-dark-950 border border-white/5 space-y-1">
            <span className="text-slate-400">2. Pull embedding model for RAG:</span>
            <pre className="text-purple-300 select-all">ollama pull nomic-embed-text</pre>
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-semibold tracking-wider text-slate-300">AVAILABLE MODELS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((m) => {
            const isSelected = settings.selectedModel === m.id;
            return (
              <div
                key={m.id}
                className={`glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3 border transition-all ${
                  isSelected ? 'border-purple-500/50 bg-purple-500/10' : 'hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-slate-100">{m.name}</h4>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 flex items-center space-x-2">
                    <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                    <span>Size: {m.size}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[11px] font-mono text-slate-500 truncate">{m.id}</span>
                  <button
                    onClick={() => handleSelectModel(m.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-purple-500 text-white font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Use Model'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
