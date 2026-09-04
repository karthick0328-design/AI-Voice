import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { apiService } from '../services/api.js';

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [quickInput, setQuickInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadTasks();
  }, [selectedStatus]);

  const loadTasks = async () => {
    try {
      const res = await apiService.getTasks({ status: selectedStatus });
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await apiService.createTask({
        title,
        description,
        priority,
        category,
        dueDate: dueDate || null
      });
      setTitle('');
      setDescription('');
      setIsAdding(false);
      loadTasks();
    } catch (err) {
      console.error('Create task error:', err);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    try {
      await apiService.createTask({
        title: quickInput,
        priority: 'MEDIUM',
        category: 'General'
      });
      setQuickInput('');
      loadTasks();
    } catch (err) {
      console.error('Quick add error:', err);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await apiService.updateTask(task._id, { status: nextStatus });
      loadTasks();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await apiService.deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const priorityColors = {
    LOW: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    URGENT: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>SMART TASK ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Tasks & Reminders</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your daily action items, reminders, and autonomous agent tasks.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="flex items-center glass-panel rounded-2xl p-2 border border-white/10">
        <input
          type="text"
          placeholder="Quick add: e.g. Call client tomorrow at 3 PM or check server logs..."
          value={quickInput}
          onChange={e => setQuickInput(e.target.value)}
          className="w-full bg-transparent px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-mono text-xs transition-all flex-shrink-0"
        >
          Add Task
        </button>
      </form>

      {/* Full Task Form */}
      {isAdding && (
        <form onSubmit={handleCreateTask} className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-4">
          <h3 className="text-sm font-semibold text-purple-300">Create Detailed Task</h3>
          <div>
            <input
              required
              type="text"
              placeholder="Task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/40"
            />
          </div>
          <div>
            <textarea
              rows={2}
              placeholder="Additional description or instructions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
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
              className="px-4 py-2 rounded-xl bg-purple-500 text-white font-semibold text-xs hover:bg-purple-400"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/5 pb-2 text-xs font-mono">
        {['ALL', 'TODO', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStatus === status
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No tasks found in this view.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task._id}
                className="glass-card rounded-2xl p-4 flex items-center justify-between space-x-3 group transition-all hover:border-purple-500/30"
              >
                <div className="flex items-center space-x-3 truncate">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'border-white/20 hover:border-cyan-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="truncate">
                    <p className={`text-xs font-medium truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
