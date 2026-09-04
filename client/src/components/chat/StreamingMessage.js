import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Loader2 } from 'lucide-react';
import { ToolExecutionTimeline } from './ToolExecutionTimeline.js';
import { SourceReferenceCard } from './SourceReferenceCard.js';

export function StreamingMessage({ content, tools = [], sources = [], statusText }) {
  return (
    <div className="flex w-full justify-start my-4">
      <div className="flex max-w-[85%] md:max-w-[75%] space-x-3">
        {/* Avatar Icon */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20">
          <Bot className="w-4 h-4" />
        </div>

        {/* Message Content Bubble */}
        <div className="flex flex-col space-y-1 w-full">
          <div className="p-4 rounded-2xl glass-card text-slate-100 border-cyan-500/30">
            {/* Live Telemetry Status */}
            {statusText && (
              <div className="mb-2 flex items-center space-x-2 text-xs font-mono text-cyan-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{statusText}</span>
              </div>
            )}

            {/* Tool Execution Timeline */}
            {tools && tools.length > 0 && (
              <ToolExecutionTimeline tools={tools} />
            )}

            {/* Progressive Streaming Text */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed break-words min-h-[24px]">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
              )}
            </div>

            {/* Source Reference Cards */}
            {sources && sources.length > 0 && (
              <SourceReferenceCard sources={sources} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
