import React, { useState, useEffect } from 'react';

export default function GoogleSearchCard({ media, onClose }) {
  const [query, setQuery] = useState(media?.title || '');
  const [results, setResults] = useState(media?.results || []);
  const [snippet, setSnippet] = useState(media?.snippet || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (media) {
      setQuery(media.title || '');
      setSnippet(media.snippet || '');
      if (media.results && media.results.length > 0) {
        setResults(media.results);
      } else if (media.title) {
        fetchResults(media.title);
      }
    }
  }, [media]);

  const fetchResults = async (q) => {
    if (!q || !q.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/websearch?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results) setResults(data.results);
        if (data.snippet) setSnippet(data.snippet);
      }
    } catch (e) {}
    setIsLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchResults(query.trim());
    }
  };

  if (!media || media.type !== 'google') return null;

  const currentQuery = query || media.title || 'trending news';
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(currentQuery)}`;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? 'bottom-20 right-6 w-72'
          : 'top-16 left-6 sm:top-20 sm:left-8 w-[92vw] sm:w-[460px] md:w-[520px]'
      }`}
    >
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-blue-500/50 rounded-3xl overflow-hidden shadow-[0_0_45px_rgba(59,130,246,0.4)] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh]">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-950/90 to-slate-900/90 border-b border-blue-500/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center font-bold text-base shadow-md flex-shrink-0">
              <span className="text-[#4285F4]">G</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Google Live Search Panel
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[280px]">
                {currentQuery}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-600/30 hover:bg-blue-600/50 px-2.5 py-1 rounded-lg transition border border-blue-400/30 flex items-center gap-1"
              title="Open real Google search in new tab"
            >
              Google.com ↗
            </a>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-xs"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '🗖' : '🗕'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition text-sm font-bold"
              title="Close Search Panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-blue-500/20">
            {/* Live Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Google for anything..."
                className="w-full bg-slate-900 border border-blue-500/40 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none pr-20 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow transition"
              >
                {isLoading ? '...' : 'Search'}
              </button>
            </form>

            {/* AI Summary Card */}
            {snippet && (
              <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-blue-400 uppercase">
                  <span>✨</span> Instant Answer
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {snippet}
                </p>
              </div>
            )}

            {/* Live Web Results List */}
            {results && results.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Live Web Results
                </span>
                {results.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition duration-150 group flex flex-col gap-1"
                  >
                    <span className="text-[10px] text-blue-400 truncate font-mono">
                      {item.displayUrl || item.url}
                    </span>
                    <p className="text-xs text-slate-300 group-hover:text-white line-clamp-2 leading-snug">
                      {item.snippet}
                    </p>
                  </a>
                ))}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="flex items-center gap-2 pt-1 flex-shrink-0">
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🔍</span> Open Full Google Page ↗
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <span>▶</span> YouTube
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
