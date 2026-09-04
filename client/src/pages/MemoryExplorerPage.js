import React, { useState, useEffect } from 'react';
import { BrainCircuit, Search, Plus, Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import { apiService } from '../services/api.js';

export function MemoryExplorerPage() {
  const [memories, setMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // New Memory Form state
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('FACT');
  const [newImportance, setNewImportance] = useState(7);
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    loadMemories();
  }, [selectedType]);

  const loadMemories = async () => {
    try {
      const res = await apiService.getMemories({ search: searchQuery, type: selectedType });
      setMemories(res.data || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await apiService.createMemory({
        content: newContent,
        type: newType,
        importance: Number(newImportance),
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setNewContent('');
      setNewTags('');
      setIsAdding(false);
      loadMemories();
    } catch (err) {
      console.error('Create memory error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteMemory(id);
      loadMemories();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear ALL persistent memories?')) {
      try {
        await apiService.clearMemories();
        loadMemories();
      } catch (err) {
        console.error('Clear error:', err);
      }
    }
  };

  const types = ['ALL', 'FACT', 'PREFERENCE', 'PROJECT', 'GOAL', 'INSTRUCTION'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>LONG-TERM MEMORY ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Memory Explorer</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View, curate, and search persistent facts, preferences, and project guidelines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleClearAll}
            className="px-3 py-2 rounded-xl text-xs font-mono text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all"
          >
            Clear All
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Add Memory Modal/Drawer */}
      {isAdding && (
        <form onSubmit={handleCreate} className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-sm font-semibold text-cyan-300">Create New Memory Record</h3>
          <div>
            <textarea
              required
              rows={2}
              placeholder="e.g. User prefers Python and clean architecture with zero external APIs..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none"
              >
                {types.filter(t => t !== 'ALL').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Importance (1 - 10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newImportance}
                onChange={e => setNewImportance(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="tech, preferences, ui"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none"
              />
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
              className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadMemories()}
            className="w-full bg-dark-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedType === t
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {memories.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
            No memories found matching current filter.
          </div>
        ) : (
          memories.map((m) => (
            <div key={m._id} className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3 group">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {m.type}
                  </span>
                  <span className="text-slate-400">
                    Weight: {m.importance}/10
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {m.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
                <div className="flex items-center space-x-1 truncate">
                  {m.tags && m.tags.map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-dark-900 text-slate-400 text-[10px] font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
