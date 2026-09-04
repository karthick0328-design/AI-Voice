import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Plus, BrainCircuit, CheckSquare,
  Zap, FolderArchive, PenTool, Cpu, Settings, Pin, Trash2, Search
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { useAgent } from '../../context/AgentContext.js';

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentConversationId, setCurrentConversationId, clearStreaming } = useAgent();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const res = await apiService.getConversations({ search: searchQuery });
      setConversations(res.data || []);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const handleNewChat = () => {
    clearStreaming();
    setCurrentConversationId(null);
    navigate('/chat');
    if (onClose) onClose();
  };

  const handleSelectConv = (id) => {
    clearStreaming();
    setCurrentConversationId(id);
    navigate(`/chat/${id}`);
    if (onClose) onClose();
  };

  const handleDeleteConv = async (e, id) => {
    e.stopPropagation();
    try {
      await apiService.deleteConversation(id);
      if (currentConversationId === id) {
        handleNewChat();
      } else {
        loadConversations();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTogglePin = async (e, id, currentPinned) => {
    e.stopPropagation();
    try {
      await apiService.updateConversation(id, { pinned: !currentPinned });
      loadConversations();
    } catch (err) {
      console.error('Pin error:', err);
    }
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'Chat Agent', icon: MessageSquare },
    { to: '/memories', label: 'Memories', icon: BrainCircuit },
    { to: '/tasks', label: 'Tasks & Reminders', icon: CheckSquare },
    { to: '/automations', label: 'Automations', icon: Zap },
    { to: '/knowledge', label: 'Knowledge Base', icon: FolderArchive },
    { to: '/content', label: 'Content Studio', icon: PenTool },
    { to: '/models', label: 'Model Manager', icon: Cpu },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex flex-col bg-dark-900 border-r border-white/5 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-cyan-500/20">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 cyber-glow">AETHER</h1>
            <p className="text-[10px] font-mono text-cyan-400/80">PERSONAL AI OS</p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-3 border-b border-white/5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Chat History Section */}
      <div className="flex-1 flex flex-col min-h-0 px-3 py-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">CONVERSATIONS</span>
          <span className="text-[10px] font-mono text-cyan-400">{conversations.length}</span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              loadConversations();
            }}
            className="w-full bg-dark-950 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
          />
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = currentConversationId === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectConv(c._id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-dark-800 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {c.pinned && <Pin className="w-3 h-3 text-cyan-400 flex-shrink-0 fill-current" />}
                    <span className="truncate">{c.title || 'Untitled'}</span>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleTogglePin(e, c._id, c.pinned)}
                      className="p-1 hover:text-cyan-300"
                      title={c.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConv(e, c._id)}
                      className="p-1 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
