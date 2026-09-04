import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Mic, Globe, CheckSquare, PenTool, FolderArchive,
  ArrowRight, Sparkles, BrainCircuit, Activity, Zap, CheckCircle2
} from 'lucide-react';
import { apiService } from '../services/api.js';
import { useAgent } from '../context/AgentContext.js';

export function DashboardPage() {
  const navigate = useNavigate();
  const { settings, backendHealth, setCurrentConversationId } = useAgent();
  const [tasks, setTasks] = useState([]);
  const [memories, setMemories] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tRes, mRes, aRes, cRes] = await Promise.all([
        apiService.getTasks({ status: 'TODO' }),
        apiService.getMemories(),
        apiService.getAutomations(),
        apiService.getConversations()
      ]);
      setTasks(tRes.data.slice(0, 4) || []);
      setMemories(mRes.data.slice(0, 3) || []);
      setAutomations(aRes.data.slice(0, 3) || []);
      setRecentConversations(cRes.data.slice(0, 3) || []);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    { title: 'Ask AI Agent', icon: MessageSquare, path: '/chat', desc: 'Reason with local Llama model', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400' },
    { title: 'Search Web', icon: Globe, path: '/chat', desc: 'Real-time web information retrieval', color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
    { title: 'Create Task', icon: CheckSquare, path: '/tasks', desc: 'Reminders & prioritized todos', color: 'from-purple-500/20 to-pink-500/20 text-purple-400' },
    { title: 'Write Content', icon: PenTool, path: '/content', desc: 'Draft emails, articles, documents', color: 'from-amber-500/20 to-orange-500/20 text-amber-400' },
    { title: 'Upload Document', icon: FolderArchive, path: '/knowledge', desc: 'Index PDF/TXT for local RAG', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
    { title: 'Automations', icon: Zap, path: '/automations', desc: 'Schedule multi-step workflows', color: 'from-rose-500/20 to-red-500/20 text-rose-400' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl glass-panel p-6 overflow-hidden border border-white/10">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AETHER PERSONAL AI OS READY</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {getTimeGreeting()}, User
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Your autonomous, local-first companion is primed for natural conversation, tools, persistent memory, and workflow automation.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentConversationId(null);
              navigate('/chat');
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20 self-start md:self-auto"
          >
            <span>Start New Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold tracking-wider text-slate-400">QUICK ACTIONS</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-start p-4 rounded-2xl glass-card text-left transition-all hover:scale-[1.02]"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} border border-white/5 mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">{action.title}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{action.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry & Modules Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Tasks */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-semibold text-slate-200">PENDING TASKS</h3>
            </div>
            <button onClick={() => navigate('/tasks')} className="text-xs text-cyan-400 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending tasks for today.</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-white/5 text-xs">
                  <div className="truncate">
                    <p className="font-medium text-slate-200 truncate">{task.title}</p>
                    <span className="text-[10px] font-mono text-purple-400">{task.priority}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{task.category}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Memory Highlights */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-semibold text-slate-200">PERSISTENT MEMORIES</h3>
            </div>
            <button onClick={() => navigate('/memories')} className="text-xs text-cyan-400 hover:underline">
              Explorer
            </button>
          </div>

          <div className="space-y-2">
            {memories.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No long-term memories extracted yet.</p>
            ) : (
              memories.map((m) => (
                <div key={m._id} className="p-2.5 rounded-xl bg-dark-900/60 border border-white/5 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
                    <span>{m.type}</span>
                    <span>Level {m.importance}/10</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System & Automations Status */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-semibold text-slate-200">SYSTEM HEALTH</h3>
            </div>
            <button onClick={() => navigate('/models')} className="text-xs text-cyan-400 hover:underline">
              Models
            </button>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-white/5">
              <span className="text-slate-400">Ollama Engine:</span>
              <span className={backendHealth.available ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {backendHealth.available ? "ONLINE" : "ADAPTIVE FALLBACK"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-white/5">
              <span className="text-slate-400">Default Model:</span>
              <span className="text-purple-300 font-semibold">{settings.selectedModel || 'llama3.1:8b'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-white/5">
              <span className="text-slate-400">Database:</span>
              <span className="text-emerald-400 font-semibold">MongoDB Connected</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-white/5">
              <span className="text-slate-400">Active Automations:</span>
              <span className="text-cyan-400 font-semibold">{automations.length} scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
