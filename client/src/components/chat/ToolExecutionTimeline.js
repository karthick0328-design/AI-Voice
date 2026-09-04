import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Cpu, Globe, Database, Compass } from 'lucide-react';

export function ToolExecutionTimeline({ tools = [] }) {
  const [expandedIndices, setExpandedIndices] = useState({});

  if (!tools || tools.length === 0) return null;

  const toggleExpand = (idx) => {
    setExpandedIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getToolIcon = (name) => {
    switch (name) {
      case 'webSearch': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'openWebPage':
      case 'browserAutomation': return <Compass className="w-4 h-4 text-purple-400" />;
      case 'saveMemory':
      case 'searchMemory': return <Database className="w-4 h-4 text-emerald-400" />;
      default: return <Cpu className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="my-3 space-y-2">
      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 px-1">
        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
        <span>AGENT TOOL EXECUTION TIMELINE</span>
      </div>

      <div className="space-y-1.5">
        {tools.map((t, idx) => {
          const isExpanded = !!expandedIndices[idx];
          const isSuccess = t.status === 'completed' || t.status === 'COMPLETED' || t.success;
          const isRunning = t.status === 'running' || t.status === 'pending';

          return (
            <div key={idx} className="border border-white/5 bg-dark-900/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-cyan-500/30">
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-mono focus:outline-none"
              >
                <div className="flex items-center space-x-2.5">
                  {getToolIcon(t.toolName || t.name)}
                  <span className="font-semibold text-slate-200">{t.toolName || t.name}</span>
                  {t.duration && (
                    <span className="flex items-center space-x-1 text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{t.duration}ms</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {isRunning ? (
                    <span className="flex items-center space-x-1 text-amber-400 text-[11px] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>Running</span>
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Success</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-rose-400 text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 bg-dark-950/40 text-[11px] font-mono space-y-2 text-slate-300">
                  {t.input && (
                    <div>
                      <span className="text-slate-500 font-semibold">INPUT:</span>
                      <pre className="mt-1 p-2 rounded bg-dark-900 overflow-x-auto text-cyan-300">
                        {JSON.stringify(t.input, null, 2)}
                      </pre>
                    </div>
                  )}
                  {(t.output || t.data) && (
                    <div>
                      <span className="text-slate-500 font-semibold">OUTPUT:</span>
                      <pre className="mt-1 p-2 rounded bg-dark-900 overflow-x-auto text-emerald-300 max-h-40">
                        {typeof (t.output || t.data) === 'string'
                          ? (t.output || t.data)
                          : JSON.stringify(t.output || t.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
