import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

export function SourceReferenceCard({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
      <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400">
        <Globe className="w-3.5 h-3.5" />
        <span className="font-semibold">SEARCH SOURCES ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-2.5 rounded-xl border border-white/5 bg-dark-900/70 hover:border-cyan-500/40 hover:bg-dark-850 transition-all text-left"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                <span>{source.title}</span>
                <ExternalLink className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100 flex-shrink-0" />
              </div>
              {source.snippet && (
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {source.snippet}
                </p>
              )}
            </div>

            <span className="mt-2 text-[10px] font-mono text-cyan-400/80 truncate">
              {source.domain || (source.url ? new URL(source.url).hostname : 'source')}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
