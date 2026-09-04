import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Volume2, VolumeX, Bot, User, BrainCircuit } from 'lucide-react';
import { ToolExecutionTimeline } from './ToolExecutionTimeline.js';
import { SourceReferenceCard } from './SourceReferenceCard.js';
import { useAgent } from '../../context/AgentContext.js';

export function MessageItem({ message, onEdit }) {
  const { speakMessage, stopSpeaking, aiState } = useAgent();
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (aiState === 'SPEAKING') {
      stopSpeaking();
    } else {
      speakMessage(message.content);
    }
  };

  return (
    <div className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'} my-4 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] space-x-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar Icon */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isAssistant
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
        }`}>
          {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Message Content Bubble */}
        <div className="flex flex-col space-y-1">
          <div className={`p-4 rounded-2xl ${
            isAssistant
              ? 'glass-card text-slate-100'
              : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white'
          }`}>
            {/* Memory badge if memories were used */}
            {message.memoriesUsed && message.memoriesUsed.length > 0 && (
              <div className="mb-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                <BrainCircuit className="w-3 h-3" />
                <span>Used {message.memoriesUsed.length} memories</span>
              </div>
            )}

            {/* Markdown Body */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed break-words">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-dark-900 text-cyan-300 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="my-2 rounded-xl bg-dark-900 border border-white/10 overflow-hidden font-mono text-xs">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-dark-850 border-b border-white/5 text-[11px] text-slate-400">
                          <span>Code snippet</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(String(children))}
                            className="hover:text-cyan-300 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-cyan-200">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Tool Execution Timeline */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <ToolExecutionTimeline tools={message.toolCalls} />
            )}

            {/* Source Reference Cards */}
            {message.sources && message.sources.length > 0 && (
              <SourceReferenceCard sources={message.sources} />
            )}
          </div>

          {/* Action Toolbar */}
          <div className={`flex items-center space-x-2 text-xs text-slate-400 px-2 opacity-60 group-hover:opacity-100 transition-opacity ${
            isAssistant ? 'justify-start' : 'justify-end'
          }`}>
            <span className="text-[10px] font-mono">
              {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-cyan-300 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isAssistant && (
              <button
                onClick={handleSpeak}
                className="p-1 hover:text-cyan-300 transition-colors"
                title="Speak message aloud"
              >
                {aiState === 'SPEAKING' ? <VolumeX className="w-3.5 h-3.5 text-emerald-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
