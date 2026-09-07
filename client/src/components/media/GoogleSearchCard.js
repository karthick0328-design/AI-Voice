import React, { useState, useEffect } from 'react';

export default function GoogleSearchCard({ media, onClose }) {
  const [query, setQuery] = useState(media?.title || '');
  const [results, setResults] = useState(media?.results || []);
  const [snippet, setSnippet] = useState(media?.snippet || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState(0);

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

  const currentQuery = query || media.title || 'trending search';
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(currentQuery)}`;

  // Dynamic People Also Ask list based on query
  const faqs = [
    {
      q: `What is the simple meaning of ${currentQuery}?`,
      a: snippet || `According to dictionaries and web knowledge, ${currentQuery} refers to the principal definition and context as indexed across Google search results.`
    },
    {
      q: `What is the origin and background of ${currentQuery}?`,
      a: `The term ${currentQuery} is widely documented in encyclopedic databases with historical usage, cultural significance, and modern terminology.`
    },
    {
      q: `Where can I find more detailed information about ${currentQuery}?`,
      a: `You can click "Open in Google.com" below to explore complete Wikipedia pages, dictionary entries, news articles, and live web panels.`
    }
  ];

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 w-screen h-screen z-50 bg-[#202124] flex flex-col m-0 p-0 rounded-none'
          : isMinimized
            ? 'fixed z-40 bottom-20 right-6 w-80'
            : 'fixed z-40 top-14 left-4 sm:top-16 sm:left-8 w-[95vw] sm:w-[540px] md:w-[620px]'
      }`}
    >
      {/* Chrome Browser Window Container */}
      <div className={`bg-[#202124] text-slate-200 flex flex-col overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.7)] ${
        isFullscreen ? 'w-full h-full' : 'rounded-2xl border border-slate-700/80 max-h-[85vh]'
      }`}>
        
        {/* 1. Chrome Window Titlebar & Tab */}
        <div className="bg-[#1f2023] px-2 pt-2 pb-0 flex items-center justify-between border-b border-[#292a2d] select-none">
          {/* Active Chrome Tab */}
          <div className="flex items-center gap-2 bg-[#303134] text-slate-200 px-3.5 py-1.5 rounded-t-xl text-xs font-medium max-w-[280px] sm:max-w-[340px] shadow-sm truncate border-t border-x border-slate-600/40">
            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-[#4285F4] flex-shrink-0">
              G
            </span>
            <span className="truncate">{currentQuery} - Google Search</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white ml-1 text-xs">✕</button>
          </div>

          {/* Chrome Window Buttons */}
          <div className="flex items-center gap-2 px-2 pb-1.5 text-slate-400 text-xs">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:text-white p-1 rounded hover:bg-white/10"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              —
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hover:text-white p-1 rounded hover:bg-white/10"
              title={isFullscreen ? "Exit Fullscreen" : "Maximize"}
            >
              {isFullscreen ? "🗗" : "🗖"}
            </button>
            <button
              onClick={onClose}
              className="hover:text-red-400 p-1 rounded hover:bg-white/10 text-sm font-bold"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. Chrome Navigation & URL Omnibox Bar */}
        <div className="bg-[#292a2d] px-3 py-2 flex items-center gap-2 border-b border-[#3c4043] select-none">
          {/* Back, Forward, Refresh */}
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <button className="hover:text-white p-1 rounded hover:bg-white/5">←</button>
            <button className="hover:text-white p-1 rounded hover:bg-white/5">→</button>
            <button onClick={() => fetchResults(query)} className="hover:text-white p-1 rounded hover:bg-white/5">↻</button>
          </div>

          {/* Omnibox Address Bar */}
          <div className="flex-1 bg-[#202124] border border-slate-700/60 rounded-full px-3 py-1 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 text-[11px]">🔒</span>
              <span className="text-slate-400">https://</span>
              <span className="text-white font-medium truncate">www.google.com/search?q={encodeURIComponent(currentQuery)}</span>
            </div>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-full ml-1 flex-shrink-0 transition"
              title="Open in new real browser tab"
            >
              Open Tab ↗
            </a>
          </div>
        </div>

        {/* 3. Google Search Webpage Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto bg-[#202124] p-4 sm:p-6 flex flex-col gap-4 text-slate-100 scrollbar-thin scrollbar-thumb-slate-700">
            
            {/* Google Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-[#3c4043]">
              {/* Colorful Google Logo */}
              <div className="flex items-center gap-0.5 select-none pr-2">
                <span className="text-[#4285F4] font-bold text-xl tracking-tighter">G</span>
                <span className="text-[#EA4335] font-bold text-xl tracking-tighter">o</span>
                <span className="text-[#FBBC05] font-bold text-xl tracking-tighter">o</span>
                <span className="text-[#4285F4] font-bold text-xl tracking-tighter">g</span>
                <span className="text-[#34A853] font-bold text-xl tracking-tighter">l</span>
                <span className="text-[#EA4335] font-bold text-xl tracking-tighter">e</span>
              </div>

              {/* Google Interactive Pill Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Google or type a URL"
                  className="w-full bg-[#303134] hover:bg-[#35363a] focus:bg-[#303134] text-white text-xs sm:text-sm rounded-full pl-4 pr-16 py-2 border border-transparent focus:border-blue-500 outline-none shadow-sm transition"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="submit"
                    className="p-1 text-slate-400 hover:text-white"
                    title="Search"
                  >
                    🔍
                  </button>
                </div>
              </form>
            </div>

            {/* Google Search Navigation Filter Tabs */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-b border-[#3c4043] pb-2 -mt-1 select-none overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-1 border-b-2 font-semibold transition ${
                  activeTab === 'all'
                    ? 'text-[#8ab4f8] border-[#8ab4f8]'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`pb-1 border-b-2 transition ${
                  activeTab === 'images'
                    ? 'text-[#8ab4f8] border-[#8ab4f8]'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-1 border-b-2 transition ${
                  activeTab === 'videos'
                    ? 'text-[#8ab4f8] border-[#8ab4f8]'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`pb-1 border-b-2 transition ${
                  activeTab === 'news'
                    ? 'text-[#8ab4f8] border-[#8ab4f8]'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                News
              </button>
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-200 ml-auto text-[11px]"
              >
                Tools
              </a>
            </div>

            {/* Google Search Results Count */}
            <p className="text-[11px] text-[#9aa0a6] select-none -mt-2">
              About 1,420,000,000 results (0.28 seconds)
            </p>

            {/* 4. Google Featured Snippet / Knowledge Card */}
            {snippet && (
              <div className="bg-[#303134] rounded-2xl p-4 sm:p-5 border border-[#3c4043] flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
                  <span className="font-semibold uppercase tracking-wider text-[#8ab4f8] flex items-center gap-1">
                    <span>💡</span> Overview & Definition
                  </span>
                  <span>Google AI & Web Overview</span>
                </div>

                <div className="text-sm sm:text-base text-[#e8eaed] leading-relaxed font-normal">
                  {snippet}
                </div>

                <div className="pt-2 border-t border-[#3c4043] flex items-center justify-between">
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#8ab4f8] hover:underline flex items-center gap-1"
                  >
                    <span>Google Knowledge Graph</span>
                    <span>›</span>
                    <span className="text-slate-400">{currentQuery}</span>
                  </a>

                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-300 hover:text-white bg-[#3c4043] hover:bg-slate-600 px-2.5 py-1 rounded-md transition"
                  >
                    Full Google View ↗
                  </a>
                </div>
              </div>
            )}

            {/* 5. Google "People Also Ask" Section */}
            <div className="bg-[#202124] border border-[#3c4043] rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#e8eaed] px-1 select-none">
                People also ask
              </span>
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-[#3c4043] last:border-0 pb-1.5">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    className="w-full py-1.5 text-left text-xs font-medium text-[#e8eaed] hover:text-[#8ab4f8] flex items-center justify-between transition"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 text-xs ml-2">{openFaq === idx ? '▲' : '▼'}</span>
                  </button>
                  {openFaq === idx && (
                    <p className="text-xs text-[#bdc1c6] pt-1 pb-2 pl-1 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* 6. Google Organic Search Results List */}
            {results && results.length > 0 && (
              <div className="flex flex-col gap-4 pt-1">
                {results.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 group">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-[#bdc1c6] group-hover:underline"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-slate-300">
                        🌐
                      </span>
                      <span className="truncate">{item.displayUrl || item.url}</span>
                    </a>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#8ab4f8] group-hover:underline leading-snug"
                    >
                      {item.snippet?.slice(0, 45) || currentQuery} - Web Article
                    </a>

                    <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                      {item.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Google Action Buttons */}
            <div className="pt-2 pb-1 flex items-center gap-2">
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-semibold text-xs rounded-xl transition shadow text-center flex items-center justify-center gap-1.5"
              >
                <span>🔍</span> Open Search on Google.com ↗
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-[#303134] hover:bg-[#3c4043] text-red-400 font-semibold text-xs rounded-xl border border-red-500/20 transition flex items-center justify-center gap-1.5"
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
