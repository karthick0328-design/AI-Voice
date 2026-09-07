import React, { useEffect, useState } from 'react';

export default function GoogleSearchCard({ media, onClose }) {
  const [query, setQuery] = useState(media?.title || '');
  const [isMinimized, setIsMinimized] = useState(false);

  const googleUrl = media?.directUrl || `https://www.google.com/search?q=${encodeURIComponent(query || 'google')}`;

  // Automatically attempt to open the real Google search tab on mount
  useEffect(() => {
    if (googleUrl) {
      try {
        const win = window.open(googleUrl, '_blank');
        if (win) win.focus();
      } catch (e) {}
    }
  }, [googleUrl]);

  const handleManualOpen = () => {
    try {
      const win = window.open(googleUrl, '_blank');
      if (win) win.focus();
    } catch (e) {
      window.location.href = googleUrl;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const newUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
      try {
        const win = window.open(newUrl, '_blank');
        if (win) win.focus();
      } catch (e) {
        window.location.href = newUrl;
      }
    }
  };

  if (!media || media.type !== 'google') return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 font-sans ${
        isMinimized
          ? 'bottom-20 right-6 w-80'
          : 'top-6 left-3 sm:top-10 sm:left-6 w-[94vw] sm:w-[540px] md:w-[680px]'
      }`}
    >
      <div className="bg-[#202124] text-[#e8eaed] rounded-3xl border border-[#3c4043] shadow-[0_24px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">
        
        {/* Top Google Header */}
        <div className="px-5 py-3.5 bg-[#202124] border-b border-[#3c4043] flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-1.5 font-semibold text-xl tracking-tight font-serif">
            <span className="text-[#8ab4f8]">G</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc04]">o</span>
            <span className="text-[#8ab4f8]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">Search</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#303134] text-xs"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? '🗖' : '—'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-[#303134] font-bold text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-6 flex flex-col gap-5">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="w-full bg-[#303134] hover:bg-[#35363a] focus-within:bg-[#303134] rounded-full px-4 py-2.5 flex items-center gap-3 border border-transparent focus-within:border-[#8ab4f8] shadow-inner transition">
                <span className="text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search on real Google..."
                  className="w-full bg-transparent text-white text-sm outline-none placeholder-slate-400 font-normal"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-semibold text-xs px-3 py-1 rounded-full transition flex-shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Launch Banner */}
            <div className="bg-[#282a2d] border border-[#3c4043] rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-inner">
              <div className="w-12 h-12 rounded-full bg-[#303134] border border-slate-600 flex items-center justify-center text-2xl shadow">
                🌐
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Real Google Search
                </h3>
                <p className="text-xs text-[#9aa0a6] mt-1">
                  Searching for: <span className="text-[#8ab4f8] font-medium">"{query || media?.title}"</span>
                </p>
              </div>

              {/* Primary Direct Google Link Button */}
              <button
                onClick={handleManualOpen}
                className="mt-1 w-full py-3 px-5 bg-gradient-to-r from-[#8ab4f8] to-[#aecbfa] hover:from-[#aecbfa] hover:to-white text-[#202124] font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>Open in Real Google Search (google.com) ↗</span>
              </button>

              <p className="text-[11px] text-slate-500">
                Click above if your browser blocked the automatic popup tab.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
