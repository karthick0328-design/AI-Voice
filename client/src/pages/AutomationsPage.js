import React, { useState, useEffect } from 'react';
import { Zap, Play, Plus, Trash2, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api.js';

export function AutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [runningId, setRunningId] = useState(null);

  // New automation form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cronExpression, setCronExpression] = useState('0 9 * * 1');
  const [humanSchedule, setHumanSchedule] = useState('Every Monday at 9:00 AM');
  const [searchTopic, setSearchTopic] = useState('Latest AI news');

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      const res = await apiService.getAutomations();
      setAutomations(res.data || []);
    } catch (err) {
      console.error('Failed to load automations:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await apiService.createAutomation({
        name,
        description,
        trigger: {
          type: 'SCHEDULE',
          cronExpression,
          humanSchedule
        },
        actions: [
          { type: 'webSearch', params: { query: searchTopic }, order: 0 },
          { type: 'summarizeContent', params: { text: '$PREVIOUS_OUTPUT' }, order: 1 },
          { type: 'createTask', params: { title: `Review Digest: ${name}` }, order: 2 }
        ]
      });
      setName('');
      setDescription('');
      setIsAdding(false);
      loadAutomations();
    } catch (err) {
      console.error('Create automation error:', err);
    }
  };

  const handleRunNow = async (id) => {
    setRunningId(id);
    try {
      await apiService.runAutomation(id);
      await loadAutomations();
    } catch (err) {
      console.error('Run automation error:', err);
    } finally {
      setRunningId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      await apiService.toggleAutomation(id);
      loadAutomations();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteAutomation(id);
      loadAutomations();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 mb-1">
            <Zap className="w-4 h-4" />
            <span>AUTONOMOUS ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Automation Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure periodic triggers, multi-step agent actions, and review execution logs.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Add Workflow Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-4">
          <h3 className="text-sm font-semibold text-rose-300">Create Scheduled Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Workflow Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Weekly AI Intelligence Digest"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Schedule Description</label>
              <input
                type="text"
                value={humanSchedule}
                onChange={e => setHumanSchedule(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Cron Expression</label>
              <input
                type="text"
                value={cronExpression}
                onChange={e => setCronExpression(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Search Topic</label>
              <input
                type="text"
                value={searchTopic}
                onChange={e => setSearchTopic(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-dark-950 border border-white/5 text-xs font-mono text-slate-300 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold">ACTION SEQUENCE CHAIN:</span>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-cyan-400">1. webSearch</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-purple-400">2. summarizeContent</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-emerald-400">3. createTask</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-400"
            >
              Save Automation
            </button>
          </div>
        </form>
      )}

      {/* Automations List */}
      <div className="space-y-3">
        {automations.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No active automations. Create your first autonomous workflow above.
          </div>
        ) : (
          automations.map((auto) => (
            <div key={auto._id} className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-slate-100">{auto.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      auto.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {auto.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                    {auto.trigger?.humanSchedule || auto.trigger?.cronExpression}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRunNow(auto._id)}
                    disabled={runningId === auto._id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-mono transition-all disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{runningId === auto._id ? 'Running...' : 'Run Now'}</span>
                  </button>
                  <button
                    onClick={() => handleToggle(auto._id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all"
                  >
                    {auto.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(auto._id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Execution History Snippet */}
              {auto.executionHistory && auto.executionHistory.length > 0 && (
                <div className="pt-3 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">LATEST EXECUTION:</span>
                  <div className="flex items-center space-x-2 text-xs font-mono bg-dark-950/60 p-2.5 rounded-xl border border-white/5">
                    {auto.executionHistory[0].status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="text-slate-300 truncate">{auto.executionHistory[0].outputSummary}</span>
                    <span className="text-[10px] text-slate-500 ml-auto flex-shrink-0">
                      {new Date(auto.executionHistory[0].executedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
