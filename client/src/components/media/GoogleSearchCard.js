import React from 'react';

export default function GoogleSearchCard({ media, onClose }) {
  if (!media || media.type !== 'google') return null;

  const searchQuery = media.title || '';
  const googleUrl = media.directUrl || `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

  const handleOpenGoogle = () => {
    try {
      window.open(googleUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {}
  };

  return (
    <div className="fixed z-40 top-16 left-6 sm:top-20 sm:left-8 w-[92vw] sm:w-[440px] md:w-[480px] animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-blue-500/50 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.35)]">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-950/80 to-slate-900/80 border-b border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center font-bold text-base shadow-md">
              <span className="text-[#4285F4]">G</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Google Web Search
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[280px]">
                {searchQuery}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-600/30 hover:bg-blue-600/50 px-2.5 py-1 rounded-lg transition border border-blue-400/30 flex items-center gap-1"
              title="Open full Google search in new tab"
            >
              Open Tab ↗
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition text-sm font-bold"
              title="Close Search Card"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-inner">
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {media.snippet || `Searching Google for "${searchQuery}". Click below to explore all live results, news, images, and knowledge panels.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔍</span> View Google Results ↗
            </a>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>▶</span> YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
