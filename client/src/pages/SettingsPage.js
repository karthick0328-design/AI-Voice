import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Volume2, ShieldCheck, BrainCircuit, Bot } from 'lucide-react';
import { useAgent } from '../context/AgentContext.js';
import { speechService } from '../services/speechService.js';

export function SettingsPage() {
  const { settings, updateSettingsState } = useAgent();
  const [formData, setFormData] = useState({ ...settings });
  const [voices, setVoices] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
    setVoices(speechService.getAvailableVoices());
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettingsState(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>AGENT PREFERENCES</span>
          </div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure companion personality, speech synthesis, and tool execution boundaries.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Persona Section */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>COMPANION PERSONA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Assistant Name</label>
              <input
                type="text"
                value={formData.assistantName || ''}
                onChange={e => setFormData({ ...formData, assistantName: e.target.value })}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Personality Preset</label>
              <select
                value={formData.personality || 'Helpful & Intelligent'}
                onChange={e => setFormData({ ...formData, personality: e.target.value })}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="Helpful & Intelligent">Helpful & Intelligent</option>
                <option value="Technical & Precise">Technical & Precise</option>
                <option value="Creative & Visionary">Creative & Visionary</option>
                <option value="Concise & Direct">Concise & Direct</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Base System Prompt</label>
            <textarea
              rows={3}
              value={formData.systemPrompt || ''}
              onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono"
            />
          </div>
        </div>

        {/* Voice & Speech Synthesis */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>VOICE & SPEECH SYNTHESIS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Synthesizer Voice</label>
              <select
                value={formData.voiceName || ''}
                onChange={e => setFormData({ ...formData, voiceName: e.target.value })}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none truncate"
              >
                <option value="">Default System Voice</option>
                {voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Speech Speed ({formData.speechSpeed || 1.0}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={formData.speechSpeed || 1.0}
                onChange={e => setFormData({ ...formData, speechSpeed: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 bg-dark-950 h-2 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-300">Auto-speak assistant responses</span>
            <input
              type="checkbox"
              checked={formData.autoSpeak || false}
              onChange={e => setFormData({ ...formData, autoSpeak: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 rounded"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>AUTONOMOUS ENGINE CAPABILITIES</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Persistent Memory Engine</p>
                <p className="text-[11px] text-slate-500">Automatically extract and recall user preferences and facts</p>
              </div>
              <input
                type="checkbox"
                checked={formData.memoryEnabled !== false}
                onChange={e => setFormData({ ...formData, memoryEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-400 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Real-time Web Search Tool</p>
                <p className="text-[11px] text-slate-500">Allow agent to search internet for up-to-date documentation and news</p>
              </div>
              <input
                type="checkbox"
                checked={formData.webSearchEnabled !== false}
                onChange={e => setFormData({ ...formData, webSearchEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Browser Automation (Puppeteer)</p>
                <p className="text-[11px] text-slate-500">Allow agent to inspect live web pages and take screenshots</p>
              </div>
              <input
                type="checkbox"
                checked={formData.browserAutomationEnabled !== false}
                onChange={e => setFormData({ ...formData, browserAutomationEnabled: e.target.checked })}
                className="w-4 h-4 accent-purple-400 rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
