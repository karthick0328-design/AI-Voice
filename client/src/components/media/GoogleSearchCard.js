import React, { useState, useEffect } from 'react';

// Specialized knowledge base for high-fidelity Google AI Overview cards
const TOPIC_DATABASE = {
  murugan: {
    title: 'Murugan',
    topicName: 'Lord Murugan',
    entityQuery: 'mean by Murugan',
    languageBadge: 'தமிழ்',
    overviewLead: 'Lord Murugan means "**the beautiful one**," "**youthful**," or "**godliness**" in Tamil, and he is revered as the Hindu god of war, victory, wisdom, and courage.',
    image: 'https://images.unsplash.com/photo-1567591414240-e18e79c5c2e1?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Etymology and Meaning',
    bulletPoints: [
      {
        label: 'Root Word',
        text: 'Derived from the Tamil word "Murugu", meaning beauty, fragrance, sweetness, youth, and divinity.'
      },
      {
        label: 'Appearance',
        text: 'He is traditionally depicted as an eternally youthful, handsome, and radiant warrior.'
      },
      {
        label: 'Symbolism',
        text: 'His divine spear, the Vel, represents sharp intellect, broad vision, and profound spiritual wisdom conquering ignorance.'
      },
      {
        label: 'Tamil Deity',
        text: 'Revered as "Tamil Kadavul" (God of the Tamils) and the patron deity of the Tamil language and literature.'
      }
    ],
    expandedDetails: [
      {
        label: 'Six Sacred Abodes',
        text: 'Known as Arupadai Veedu (Thiruparankundram, Tiruchendur, Palani, Swamimalai, Thiruthani, and Pazhamudircholai).'
      },
      {
        label: 'Family & Vehicle',
        text: 'Son of Lord Shiva and Goddess Parvati, brother of Ganesha. His vahana (mount) is the sacred peacock (Mayil).'
      }
    ],
    sources: [
      {
        name: 'Quora',
        domain: 'quora.com',
        title: 'What does the name Murugan mean? - Quora',
        url: 'https://www.quora.com/What-does-the-name-Murugan-mean',
        iconType: 'quora',
        snippet: 'In Tamil, "Murugu" means beauty, youthfulness, godliness, and fragrance. Hence, Murugan translates to "the Handsome one", "the Youthful one"...',
        meta: '50+ answers · 6 years ago'
      },
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Kartikeya (Murugan) - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Kartikeya',
        iconType: 'wikipedia',
        snippet: 'Kartikeya (Sanskrit: कार्त्तिकेय), also known as Skanda, Murugan, Shanmukha and Subramanya, is the Hindu god of war and victory...',
        meta: 'Free Encyclopedia'
      },
      {
        name: 'Tamil Heritage',
        domain: 'tamilheritage.org',
        title: 'Significance & Spiritual Essence of Lord Murugan',
        url: 'https://www.google.com/search?q=murugan+etymology+meaning',
        iconType: 'heritage',
        snippet: 'Murugan is celebrated as the embodiment of supreme beauty, valor, and wisdom across Tamil devotional traditions...',
        meta: 'Cultural Archives'
      }
    ]
  },
  karthik: {
    title: 'Karthik',
    topicName: 'Karthik (Kartikeya)',
    entityQuery: 'mean by Karthik',
    languageBadge: 'संस्कृत / தமிழ்',
    overviewLead: 'Karthik (or Karthick) is an Indian name meaning "**radiant**," "**courageous**," or "**bestower of courage**." It is derived from the Krittika (Pleiades) star constellation and directly refers to **Lord Murugan / Kartikeya**.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Etymology and Significance',
    bulletPoints: [
      {
        label: 'Origin',
        text: 'Derived from Krittika (the six Krittika sisters / Pleiades who nurtured Lord Kartikeya).'
      },
      {
        label: 'Core Meaning',
        text: 'Signifies brilliance, eternal youth, valor, and divine radiance.'
      },
      {
        label: 'Prominent Figures',
        text: 'Widely used across India for prominent artists, actors (Murali Karthikeyan Muthuraman), musicians, and scholars.'
      }
    ],
    expandedDetails: [
      {
        label: 'Cultural Connection',
        text: 'Deeply celebrated during the Tamil month of Karthigai and Karthigai Deepam festival of lights.'
      }
    ],
    sources: [
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Karthik (given name) - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Karthik',
        iconType: 'wikipedia',
        snippet: 'Karthik is a common Indian male given name of Sanskrit origin, named after the Hindu god of war, Kartikeya...',
        meta: 'Encyclopedia Entry'
      },
      {
        name: 'Quora',
        domain: 'quora.com',
        title: 'What is the real meaning of the name Karthick? - Quora',
        url: 'https://www.quora.com/What-is-the-meaning-of-the-name-Karthik',
        iconType: 'quora',
        snippet: 'The name Karthik represents courage, leadership, and brilliance. It is also the month in the Hindu calendar dedicated to light...',
        meta: '30+ answers'
      }
    ]
  },
  cockpit: {
    title: 'Cockpit',
    topicName: 'Cockpit (Flight Deck)',
    entityQuery: 'cockpit',
    languageBadge: 'Aviation',
    overviewLead: 'A cockpit (or **flight deck**) is the area, usually near the front of an aircraft or spacecraft, from which a **pilot controls the vehicle**.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Design and Functionality',
    bulletPoints: [
      {
        label: 'Origin of Term',
        text: 'First recorded in the 16th century describing cockfighting arenas; adopted by the Royal Navy in 1700s and aviation in 1914.'
      },
      {
        label: 'Components',
        text: 'Contains Primary Flight Displays (PFD), Navigation Displays (ND), Flight Management Systems (FMS), and throttle quadrant.'
      },
      {
        label: 'Crew Roles',
        text: 'Operated by the Pilot in Command (Captain) and First Officer (Co-pilot).'
      }
    ],
    expandedDetails: [
      {
        label: 'Glass Cockpit',
        text: 'Modern cockpits utilize electronic flight instrument displays and Head-Up Displays (HUD) replacing analog gauges.'
      }
    ],
    sources: [
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Cockpit - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Cockpit',
        iconType: 'wikipedia',
        snippet: 'A cockpit or flight deck is the area, usually near the front of an aircraft or spacecraft, from which a pilot controls the vehicle...',
        meta: 'Aerospace Engineering'
      },
      {
        name: 'Boeing & Airbus Info',
        domain: 'aviationsafety.org',
        title: 'Flight Deck Ergonomics and Safety Systems',
        url: 'https://www.google.com/search?q=cockpit+flight+deck',
        iconType: 'heritage',
        snippet: 'Understanding modern dual-pilot cockpit layouts, flight control side-sticks, and automated safety envelopes...',
        meta: 'Aviation Standard'
      }
    ]
  }
};

export default function GoogleSearchCard({ media, onClose }) {
  const [query, setQuery] = useState(media?.title || '');
  const [results, setResults] = useState(media?.results || []);
  const [snippet, setSnippet] = useState(media?.snippet || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const currentQuery = query || media.title || 'Murugan';
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(currentQuery)}`;
  const lowerQ = currentQuery.toLowerCase();

  // Match topic from knowledge database
  let matchedTopic = null;
  if (lowerQ.includes('murugan') || lowerQ.includes('kartikeya') || lowerQ.includes('skanda')) {
    matchedTopic = TOPIC_DATABASE.murugan;
  } else if (lowerQ.includes('karthik') || lowerQ.includes('karthick')) {
    matchedTopic = TOPIC_DATABASE.karthik;
  } else if (lowerQ.includes('cockpit') || lowerQ.includes('flight deck')) {
    matchedTopic = TOPIC_DATABASE.cockpit;
  } else {
    // Dynamic generated topic
    const cleanedTitle = currentQuery.replace(/^(?:what is mean by|mean by|what is|who is|search|search for)\s+/i, '').trim();
    matchedTopic = {
      title: cleanedTitle || currentQuery,
      topicName: cleanedTitle || currentQuery,
      entityQuery: currentQuery,
      languageBadge: 'English',
      overviewLead: snippet || `**${cleanedTitle || currentQuery}** refers to the authoritative concept, terminology, and live encyclopedic knowledge indexed across global search repositories.`,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      etymologyHeader: 'Overview and Key Points',
      bulletPoints: [
        {
          label: 'Definition',
          text: snippet || `Comprehensive definition and verified search context for "${currentQuery}".`
        },
        {
          label: 'Context',
          text: `Widely indexed across web encyclopedias, scholarly articles, and public knowledge graphs.`
        },
        {
          label: 'Discovery',
          text: `Explore live interactive sources, discussions, and media publications below.`
        }
      ],
      expandedDetails: [
        {
          label: 'Live Web Source',
          text: `Updated automatically from real-time web indexing for ${currentQuery}.`
        }
      ],
      sources: [
        {
          name: 'Wikipedia',
          domain: 'en.wikipedia.org',
          title: `${cleanedTitle} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanedTitle)}`,
          iconType: 'wikipedia',
          snippet: snippet || `Encyclopedic article and references for ${cleanedTitle}...`,
          meta: 'Free Encyclopedia'
        },
        {
          name: 'Web Sources',
          domain: 'google.com',
          title: `Explore full coverage for "${currentQuery}" on Google`,
          url: googleUrl,
          iconType: 'quora',
          snippet: `Live search results, news, community forums, and media for ${currentQuery}...`,
          meta: 'Google Search'
        }
      ]
    };
  }

  // Handle Text-to-Speech playback
  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const plainText = `${matchedTopic.overviewLead.replace(/\*\*/g, '')}. ${matchedTopic.bulletPoints.map(b => `${b.label}: ${b.text}`).join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Helper to render bold markdown in text
  const renderFormattedText = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      className={`transition-all duration-300 font-sans ${
        isFullscreen
          ? 'fixed inset-0 w-screen h-screen z-50 bg-[#1f1f1f] flex flex-col m-0 p-0 rounded-none overflow-hidden'
          : isMinimized
            ? 'fixed z-40 bottom-20 right-6 w-80'
            : 'fixed z-40 top-8 left-3 sm:top-10 sm:left-6 w-[96vw] sm:w-[620px] md:w-[840px] lg:w-[940px]'
      }`}
    >
      <div className={`bg-[#1f1f1f] text-[#e8eaed] flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] ${
        isFullscreen ? 'w-full h-full' : 'rounded-3xl border border-[#3c4043] max-h-[90vh]'
      }`}>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. TOP AUTHENTIC GOOGLE SEARCH HEADER BAR */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 py-3 bg-[#1f1f1f] border-b border-[#3c4043] flex items-center justify-between gap-3 flex-shrink-0">
          
          {/* Authentic Google Logo */}
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center select-none flex-shrink-0 text-white font-medium text-2xl tracking-tight pr-1"
          >
            <span className="text-[#8ab4f8]">G</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc04]">o</span>
            <span className="text-[#8ab4f8]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
          </a>

          {/* Centered Search Pill Input matching Chrome & Google */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center">
            <div className="w-full bg-[#303134] hover:bg-[#35363a] focus-within:bg-[#303134] rounded-full px-4 py-2 flex items-center gap-2.5 border border-transparent focus-within:border-[#8ab4f8] shadow-inner transition">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Google or type a URL..."
                className="w-full bg-transparent text-[#e8eaed] text-xs sm:text-sm outline-none placeholder-slate-400 font-normal"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                  title="Clear"
                >
                  ✕
                </button>
              )}
              <div className="h-4 w-[1px] bg-slate-600 hidden sm:block mx-0.5" />
              
              {/* Mic / Lens / Search Icons */}
              <button
                type="button"
                className="text-slate-400 hover:text-white text-sm hidden sm:inline-flex p-1"
                title="Search by voice"
              >
                🎤
              </button>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-sm hidden sm:inline-flex p-1"
                title="Search by image"
              >
                📷
              </button>
              <button
                type="submit"
                className="text-[#8ab4f8] hover:text-[#aecbfa] text-sm font-bold pl-1"
                title="Search"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Window / Tab Controls */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs flex-shrink-0">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#8ab4f8] hover:text-white bg-[#303134] hover:bg-[#3c4043] px-2.5 py-1.5 rounded-full border border-slate-700 transition hidden sm:inline-flex items-center gap-1 font-medium"
            >
              Open Google ↗
            </a>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:text-white p-1.5 rounded-lg hover:bg-[#303134] text-xs"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? '🗖' : '—'}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hover:text-white p-1.5 rounded-lg hover:bg-[#303134] text-xs"
              title={isFullscreen ? "Exit Fullscreen" : "Maximize"}
            >
              {isFullscreen ? '🗗' : '🗖'}
            </button>
            <button
              onClick={onClose}
              className="hover:text-red-400 p-1.5 rounded-lg hover:bg-[#303134] font-bold text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. GOOGLE NAVIGATION TABS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!isMinimized && (
          <div className="px-4 sm:px-8 pt-2.5 border-b border-[#3c4043] flex items-center gap-6 text-xs text-[#9aa0a6] select-none overflow-x-auto flex-shrink-0 scrollbar-none bg-[#1f1f1f]">
            {[
              { name: 'AI Mode', icon: '✦', isSpecial: true },
              { name: 'All' },
              { name: 'Images' },
              { name: 'Videos' },
              { name: 'Shopping' },
              { name: 'Forums' },
              { name: 'Short videos' },
              { name: 'News' },
              { name: 'More', isDropdown: true },
              { name: 'Tools', isDropdown: true }
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`pb-2.5 font-medium transition flex items-center gap-1.5 whitespace-nowrap text-xs ${
                  activeTab === tab.name
                    ? 'text-[#8ab4f8] border-b-[3px] border-[#8ab4f8] font-semibold'
                    : 'border-b-[3px] border-transparent hover:text-[#e8eaed]'
                }`}
              >
                {tab.isSpecial && <span className="text-[#c58af9] font-bold">✦</span>}
                {tab.name}
                {tab.isDropdown && <span className="text-[10px] text-slate-500">▾</span>}
              </button>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. GOOGLE RESULTS CONTAINER (AI OVERVIEW & WEB RESULTS) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-[#1f1f1f] scrollbar-thin scrollbar-thumb-slate-700 flex flex-col gap-6">
            
            {/* Query Info & Location Breadcrumb */}
            <div className="text-[12px] text-[#9aa0a6] select-none flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span>About 4,820,000 results (0.42 seconds)</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <span>📍 Tamil Nadu</span>
                <span className="text-slate-600">•</span>
                <span className="text-[#8ab4f8] cursor-pointer hover:underline">Choose area</span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 4. AUTHENTIC GOOGLE AI OVERVIEW CARD (Exact match to media) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-[#242628] border border-[#3c4043] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden transition">
              
              {/* Top AI Overview Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-[#3c4043]/60 pb-3">
                
                {/* Left: ✦ AI Overview badge + Language Pill */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-sm sm:text-base font-semibold text-white tracking-wide">
                    <span className="text-base sm:text-lg bg-gradient-to-r from-[#c58af9] to-[#8ab4f8] bg-clip-text text-transparent font-bold">✦</span>
                    <span>AI Overview</span>
                  </div>

                  {matchedTopic.languageBadge && (
                    <span className="bg-[#303134] hover:bg-[#3c4043] text-slate-200 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-slate-600/80 cursor-pointer select-none transition">
                      {matchedTopic.languageBadge}
                    </span>
                  )}
                </div>

                {/* Right: Speaker Audio Button & Options */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSpeech}
                    className={`p-1.5 rounded-full transition text-xs flex items-center gap-1 ${
                      isSpeaking
                        ? 'bg-[#8ab4f8] text-[#202124] font-bold animate-pulse'
                        : 'bg-[#303134] hover:bg-[#3c4043] text-slate-300 hover:text-white'
                    }`}
                    title={isSpeaking ? "Stop speech" : "Listen to overview"}
                  >
                    <span>{isSpeaking ? '⏹' : '🔊'}</span>
                    <span className="text-[10px] pr-1 hidden sm:inline">{isSpeaking ? 'Playing...' : 'Listen'}</span>
                  </button>

                  <button className="text-slate-400 hover:text-white p-1 text-sm rounded-lg hover:bg-[#303134]">
                    ⋮
                  </button>
                </div>
              </div>

              {/* Main AI Overview Content Area: Definition + Side Citations */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left: Definition & Bullet Points */}
                <div className="lg:col-span-8 flex flex-col gap-3.5">
                  
                  {/* Lead Highlighted Summary */}
                  <p className="text-sm sm:text-[15px] text-[#e8eaed] leading-relaxed">
                    {renderFormattedText(matchedTopic.overviewLead)}
                  </p>

                  {/* Etymology and Meaning Subheading */}
                  {matchedTopic.etymologyHeader && (
                    <h4 className="text-sm font-semibold text-white mt-1">
                      {matchedTopic.etymologyHeader}
                    </h4>
                  )}

                  {/* Bullet points with bold titles */}
                  <ul className="flex flex-col gap-2 text-xs sm:text-[13.5px] text-[#bdc1c6] leading-relaxed list-none pl-0">
                    {matchedTopic.bulletPoints.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold">•</span>
                        <div>
                          <strong className="text-white font-medium">{item.label}:</strong> {item.text}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Expanded details when "Show more" is active */}
                  {isExpanded && matchedTopic.expandedDetails && (
                    <ul className="flex flex-col gap-2 text-xs sm:text-[13.5px] text-[#bdc1c6] leading-relaxed list-none pl-0 pt-2 border-t border-[#3c4043]/50 animate-in fade-in duration-200">
                      {matchedTopic.expandedDetails.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold">•</span>
                          <div>
                            <strong className="text-white font-medium">{item.label}:</strong> {item.text}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Show More / Show Less Accordion Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="bg-[#303134] hover:bg-[#3c4043] text-slate-200 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-600 transition flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                      <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Deity/Topic Thumbnail & Stacked Citation Source Cards */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  
                  {/* Deity / Entity Photo Thumbnail */}
                  {matchedTopic.image && (
                    <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-slate-700/80 shadow-md relative group">
                      <img
                        src={matchedTopic.image}
                        alt={matchedTopic.topicName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-slate-200 font-medium">
                        {matchedTopic.topicName}
                      </div>
                    </div>
                  )}

                  {/* Source Citation Cards */}
                  <div className="flex flex-col gap-2">
                    {matchedTopic.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1f1f1f] hover:bg-[#2d2f31] p-2.5 rounded-xl border border-[#3c4043] transition flex items-center justify-between gap-2.5 group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {src.iconType === 'quora' ? (
                            <div className="w-5 h-5 rounded-full bg-[#b92b27] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              Q
                            </div>
                          ) : src.iconType === 'wikipedia' ? (
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                              W
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#8ab4f8] flex items-center justify-center text-[10px] font-bold text-[#202124] flex-shrink-0">
                              ✦
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="text-[11px] font-medium text-slate-300 group-hover:text-[#8ab4f8] truncate">
                              {src.title}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate">
                              {src.domain}
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-500 group-hover:text-slate-300 text-xs">↗</span>
                      </a>
                    ))}
                  </div>

                </div>

              </div>

            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 5. ORGANIC WEB SEARCH RESULTS (Authentic Google layout) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-6 pt-2">
              
              {/* Result 1: Quora */}
              <div className="flex flex-col gap-1.5 group max-w-3xl">
                <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                  <div className="w-5 h-5 rounded-full bg-[#b92b27] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    Q
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-slate-200 text-xs">Quora</span>
                    <span className="text-[11px] text-[#9aa0a6] truncate">https://www.quora.com › What-does-the-name-Murugan-mean</span>
                  </div>
                </div>
                <a
                  href="https://www.quora.com/What-does-the-name-Murugan-mean"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg font-medium text-[#8ab4f8] group-hover:underline leading-snug"
                >
                  What does the name Murugan mean? - Quora
                </a>
                <div className="text-[11px] text-slate-400 font-medium">
                  50+ answers · 6 years ago
                </div>
                <p className="text-xs sm:text-[13px] text-[#bdc1c6] leading-relaxed">
                  In Tamil, the word "Murugu" means beauty, youthfulness, godliness, and fragrance. Thus, Murugan translates to "the Handsome one", "the Youthful one", and the lord who destroys evil...
                </p>
              </div>

              {/* Result 2: Wikipedia */}
              <div className="flex flex-col gap-1.5 group max-w-3xl">
                <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                    W
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-slate-200 text-xs">Wikipedia</span>
                    <span className="text-[11px] text-[#9aa0a6] truncate">https://en.wikipedia.org › wiki › Kartikeya</span>
                  </div>
                </div>
                <a
                  href="https://en.wikipedia.org/wiki/Kartikeya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg font-medium text-[#8ab4f8] group-hover:underline leading-snug"
                >
                  Kartikeya (Murugan) - Wikipedia
                </a>
                <p className="text-xs sm:text-[13px] text-[#bdc1c6] leading-relaxed">
                  Kartikeya (Sanskrit: कार्त्तिकेय), also known as Skanda, Murugan, Shanmukha and Subramanya, is the Hindu god of war. He is the son of Shiva and Parvati, brother of Ganesha...
                </p>
              </div>

              {/* Result 3: Dynamic or Live Web Results */}
              {results && results.length > 0 && results.map((res, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 group max-w-3xl">
                  <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                    <div className="w-5 h-5 rounded-full bg-[#303134] border border-slate-600 flex items-center justify-center text-[10px] font-bold text-[#8ab4f8] flex-shrink-0">
                      🌐
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-slate-200 text-xs">{res.displayUrl || 'Web Source'}</span>
                      <span className="text-[11px] text-[#9aa0a6] truncate">{res.url}</span>
                    </div>
                  </div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg font-medium text-[#8ab4f8] group-hover:underline leading-snug"
                  >
                    {res.title || `${currentQuery} - Overview`}
                  </a>
                  <p className="text-xs sm:text-[13px] text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {res.snippet}
                  </p>
                </div>
              ))}

              {/* View all results on Google.com button */}
              <div className="pt-4 pb-2">
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#303134] hover:bg-[#3c4043] text-[#8ab4f8] hover:text-white font-medium text-xs rounded-full border border-slate-600 transition shadow"
                >
                  <span>🔍</span> View more results for "{currentQuery}" on Google.com ↗
                </a>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
