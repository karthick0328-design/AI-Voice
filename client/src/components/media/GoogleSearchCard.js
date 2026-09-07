import React, { useState, useEffect } from 'react';

export default function GoogleSearchCard({ media, onClose }) {
  const [query, setQuery] = useState(media?.title || '');
  const [results, setResults] = useState(media?.results || []);
  const [snippet, setSnippet] = useState(media?.snippet || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [openFaq, setOpenFaq] = useState(-1);

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

  const currentQuery = query || media.title || 'karthick';
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(currentQuery)}`;
  const lowerQ = currentQuery.toLowerCase();

  // Knowledge panel determination
  const isKarthik = lowerQ.includes('karthik') || lowerQ.includes('karthick');
  const isCockpit = lowerQ.includes('cockpit');

  const knowledgeData = isKarthik ? {
    title: 'Karthik',
    subtitle: 'Indian actor',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    description: 'Murali Karthikeyan Muthuraman, better known by his stage name Karthik, is an Indian actor, playback singer and politician who works in Tamil cinema. He is the son of veteran actor R. Muthuraman. Karthik was one of the prominent stars in the industry in the 80s and 90s.',
    source: 'Wikipedia',
    attributes: [
      { label: 'Born', value: '13 September 1960 (age 63 years)' },
      { label: 'Spouse', value: 'Ragini (m. 1992), Rathi (m. 1988)' },
      { label: 'Children', value: 'Gautham Karthik, Thiran Karthik, Ghayn Karthik' },
      { label: 'Awards', value: 'Tamil Nadu State Film Award, Filmfare Awards South' }
    ],
    faqs: [
      { q: 'What is meant by karthick?', a: 'Karthik is an Indian given name derived from Krittika (the Pleiades star cluster) and represents the Hindu deity Murugan / Kartikeya, symbolizing radiance and courage.' },
      { q: 'What is Sanjeev Karthick\'s religion?', a: 'Karthik follows Hinduism, deeply rooted in South Indian cultural and devotional traditions.' },
      { q: 'Who are the two wives of Karthik?', a: 'Actor Karthik married actress Ragini in 1992 and was previously married to her sister Rathi in 1988.' },
      { q: 'Who was Sanjeev Karthick\'s first wife?', a: 'Rathi was the first wife of actor Karthik.' }
    ]
  } : isCockpit ? {
    title: 'Cockpit',
    subtitle: 'Flight deck area',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80',
    description: 'A cockpit or flight deck is the area, usually near the front of an aircraft or spacecraft, from which a pilot controls the vehicle. Most modern cockpits are enclosed, except on some small aircraft, and contain flight instruments and controls.',
    source: 'Wikipedia',
    attributes: [
      { label: 'Category', value: 'Aircraft & Aerospace component' },
      { label: 'Key Features', value: 'Flight instruments, HUD, Flight Management System (FMS)' },
      { label: 'Crew', value: 'Captain (Pilot in Command), First Officer (Co-pilot)' }
    ],
    faqs: [
      { q: 'What does cockpit mean in simple words?', a: 'A cockpit is the enclosed compartment in an airplane or spacecraft where the pilots sit and operate the flight controls.' },
      { q: 'Why is it called a cockpit?', a: 'The term originated in the 16th century for a sunken pit used for cockfighting, and was later adopted in the Royal Navy and early aviation for the pilot\'s cramped control station.' },
      { q: 'What is inside an aircraft cockpit?', a: 'It includes primary flight displays, navigational instruments, throttle quadrant, sidesticks/control yokes, and communications radios.' }
    ]
  } : {
    title: currentQuery,
    subtitle: 'Search Topic Overview',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    description: snippet || `Real-time encyclopedic summary and web search results for "${currentQuery}" indexed on Google.`,
    source: 'Google Knowledge Graph',
    attributes: [
      { label: 'Query', value: currentQuery },
      { label: 'Status', value: 'Live Indexed' },
      { label: 'Type', value: 'Web & AI Search Overview' }
    ],
    faqs: [
      { q: `What is the definition of ${currentQuery}?`, a: snippet || `According to authoritative sources, ${currentQuery} represents key definitions and context across verified search entries.` },
      { q: `Where can I find more results for ${currentQuery}?`, a: `Click "Open Search on Google.com" below to explore live news, images, videos, and full web links.` }
    ]
  };

  return (
    <div
      className={`transition-all duration-300 font-sans ${
        isFullscreen
          ? 'fixed inset-0 w-screen h-screen z-50 bg-[#202124] flex flex-col m-0 p-0 rounded-none overflow-hidden'
          : isMinimized
            ? 'fixed z-40 bottom-20 right-6 w-80'
            : 'fixed z-40 top-10 left-3 sm:top-12 sm:left-6 w-[96vw] sm:w-[580px] md:w-[780px] lg:w-[880px]'
      }`}
    >
      <div className={`bg-[#202124] text-[#e8eaed] flex flex-col overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.85)] ${
        isFullscreen ? 'w-full h-full' : 'rounded-2xl border border-[#3c4043] max-h-[88vh]'
      }`}>
        
        {/* Top Google Search Bar Header */}
        <div className="px-4 py-3 bg-[#202124] border-b border-[#3c4043] flex items-center justify-between gap-3 flex-shrink-0">
          {/* Google Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-white text-2xl font-semibold tracking-tight font-serif">Google</span>
          </div>

          {/* Search Pill Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative flex items-center">
            <div className="w-full bg-[#303134] hover:bg-[#35363a] focus-within:bg-[#303134] rounded-full px-4 py-2 flex items-center gap-2.5 border border-transparent focus-within:border-[#8ab4f8] shadow-md transition">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Google..."
                className="w-full bg-transparent text-white text-xs sm:text-sm outline-none placeholder-slate-400"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-white text-xs font-bold">
                  ✕
                </button>
              )}
              <div className="h-4 w-[1px] bg-slate-600 hidden sm:block" />
              <span className="text-slate-400 hover:text-white text-xs hidden sm:inline cursor-pointer" title="Voice Search">🎤</span>
              <span className="text-slate-400 hover:text-white text-xs hidden sm:inline cursor-pointer" title="Google Lens">📷</span>
              <button type="submit" className="text-[#8ab4f8] hover:text-white text-xs font-bold pl-1">
                🔍
              </button>
            </div>
          </form>

          {/* Window & Fullscreen Controls */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs flex-shrink-0">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#8ab4f8] hover:text-white bg-[#303134] hover:bg-[#3c4043] px-2.5 py-1 rounded-lg border border-slate-700 transition hidden sm:inline-flex items-center gap-1"
            >
              Open Tab ↗
            </a>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:text-white p-1.5 rounded-lg hover:bg-[#303134]"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? '🗖' : '—'}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hover:text-white p-1.5 rounded-lg hover:bg-[#303134]"
              title={isFullscreen ? "Exit Fullscreen" : "Maximize"}
            >
              {isFullscreen ? '🗗' : '🗖'}
            </button>
            <button
              onClick={onClose}
              className="hover:text-red-400 p-1.5 rounded-lg hover:bg-[#303134] font-bold"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        {!isMinimized && (
          <div className="px-4 sm:px-6 pt-2 border-b border-[#3c4043] flex items-center gap-5 text-xs text-[#9aa0a6] select-none overflow-x-auto flex-shrink-0 scrollbar-none">
            {['AI Mode', 'All', 'Images', 'Videos', 'Short videos', 'News', 'Shopping', 'More', 'Tools'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 font-medium transition flex items-center gap-1 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-white border-b-[3px] border-[#8ab4f8] font-semibold'
                    : 'border-b-[3px] border-transparent hover:text-[#e8eaed]'
                }`}
              >
                {tab === 'AI Mode' && <span className="text-[#8ab4f8]">✦</span>}
                {tab}
                {tab === 'More' && <span>▾</span>}
              </button>
            ))}
          </div>
        )}

        {/* Search Results Area */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#202124] scrollbar-thin scrollbar-thumb-slate-700">
            {/* "Including results for" banner */}
            <div className="text-xs text-[#9aa0a6] mb-3 select-none flex items-center justify-between flex-wrap gap-2">
              <div>
                Including results for <a href={googleUrl} target="_blank" rel="noreferrer" className="text-[#8ab4f8] font-medium italic hover:underline">{currentQuery}</a>
                <span className="ml-2 text-slate-500">· Search only for {currentQuery}</span>
              </div>
              <span className="text-slate-400 text-[11px]">📍 Tamil Nadu · Choose area</span>
            </div>

            {/* 2-Column Responsive Layout: Left (Results) & Right (Knowledge Panel) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Main Search & Wikipedia & People Also Ask */}
              <div className="md:col-span-7 flex flex-col gap-5">
                
                {/* 1. Primary Wikipedia Card with Thumbnail */}
                <div className="bg-[#303134]/40 hover:bg-[#303134]/60 p-4 rounded-2xl border border-[#3c4043]/60 transition">
                  <div className="flex items-center gap-2 mb-1 text-xs text-[#bdc1c6]">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                      W
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-slate-200">Wikipedia</span>
                      <span className="text-[11px] text-[#9aa0a6] truncate">https://en.wikipedia.org › wiki › {knowledgeData.title}</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 mt-2">
                    <div className="flex-1">
                      <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base sm:text-lg font-medium text-[#8ab4f8] hover:underline flex items-center gap-1.5"
                      >
                        {knowledgeData.title} ({knowledgeData.subtitle})
                        <span className="text-[#34a853] text-xs" title="Verified">✓</span>
                      </a>
                      <p className="text-xs sm:text-sm text-[#bdc1c6] mt-1.5 leading-relaxed line-clamp-3">
                        {knowledgeData.description}
                      </p>
                    </div>

                    {knowledgeData.image && (
                      <img
                        src={knowledgeData.image}
                        alt={knowledgeData.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-700 flex-shrink-0 shadow"
                      />
                    )}
                  </div>
                </div>

                {/* 2. People Also Ask Dropdown Section */}
                <div className="bg-[#202124] border border-[#3c4043] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                  <h3 className="text-sm sm:text-base font-semibold text-[#e8eaed] mb-1 select-none">
                    People also ask
                  </h3>
                  {knowledgeData.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-[#3c4043] last:border-0 pb-2">
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                        className="w-full py-1.5 text-left text-xs sm:text-sm font-medium text-[#e8eaed] hover:text-[#8ab4f8] flex items-center justify-between transition"
                      >
                        <span>{faq.q}</span>
                        <span className="text-slate-400 text-xs ml-2">{openFaq === idx ? '▲' : '▼'}</span>
                      </button>
                      {openFaq === idx && (
                        <p className="text-xs sm:text-sm text-[#bdc1c6] pt-1.5 pb-1 pl-1 leading-relaxed animate-in fade-in duration-150">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* 3. Live Web Results */}
                {results && results.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {results.map((res, idx) => (
                      <div key={idx} className="flex flex-col gap-1 group">
                        <span className="text-[11px] text-[#9aa0a6] truncate font-mono">
                          {res.displayUrl || res.url}
                        </span>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#8ab4f8] group-hover:underline leading-snug"
                        >
                          {res.title || `${currentQuery} - Overview`}
                        </a>
                        <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                          {res.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Google Knowledge Graph Panel */}
              <div className="md:col-span-5 bg-[#303134]/50 border border-[#3c4043] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {knowledgeData.title}
                    </h2>
                    <span className="text-xs text-[#9aa0a6]">
                      {knowledgeData.subtitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <span className="cursor-pointer hover:text-white p-1">⋮</span>
                  </div>
                </div>

                {/* Hero Photo / Image Box */}
                {knowledgeData.image && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-700/80 shadow-md group">
                    <img
                      src={knowledgeData.image}
                      alt={knowledgeData.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-slate-300">
                      Source: India Today / Web
                    </div>
                    <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white">
                      📷
                    </div>
                  </div>
                )}

                {/* Description Bio */}
                <p className="text-xs text-[#bdc1c6] leading-relaxed">
                  {knowledgeData.description}
                </p>
                <div className="text-[11px] text-[#9aa0a6]">
                  Source: <a href={googleUrl} target="_blank" rel="noreferrer" className="text-[#8ab4f8] hover:underline">{knowledgeData.source}</a>
                </div>

                {/* Attributes Table */}
                <div className="pt-2 border-t border-[#3c4043] flex flex-col gap-2 text-xs">
                  {knowledgeData.attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-300 flex-shrink-0">{attr.label}</span>
                      <span className="text-[#bdc1c6] text-right">{attr.value}</span>
                    </div>
                  ))}
                </div>

                {/* Open Full Google Button */}
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-2.5 px-4 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-bold text-xs rounded-xl shadow transition text-center flex items-center justify-center gap-2"
                >
                  <span>🔍</span> View on Google.com ↗
                </a>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
