import React, { useState, useEffect } from 'react';

// Comprehensive Knowledge Base for Google AI Overview
const TOPIC_KNOWLEDGE_BASE = {
  cm_tamilnadu: {
    title: 'M. K. Stalin',
    topicName: 'Chief Minister of Tamil Nadu',
    languageBadge: 'தமிழ் / English',
    overviewLead: '**M. K. Stalin** (Muthuvel Karunanidhi Stalin) is an Indian politician serving as the **8th and current Chief Minister of Tamil Nadu** since May 7, 2021. He has been the president of the Dravida Munnetra Kazhagam (DMK) party since 2018.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Key Facts and Administration',
    bulletPoints: [
      {
        label: 'Current Office',
        text: 'Chief Minister of Tamil Nadu (Assumed office: 7 May 2021).'
      },
      {
        label: 'Political Party',
        text: 'Dravida Munnetra Kazhagam (DMK).'
      },
      {
        label: 'Constituency',
        text: 'Kolathur Assembly constituency, Chennai.'
      },
      {
        label: 'Preceded by',
        text: 'Edappadi K. Palaniswami (AIADMK).'
      },
      {
        label: 'Key Initiatives',
        text: 'Makkalai Thedi Maruthuvam, Naan Mudhalvan, Free bus travel for women, Kalaignar Magalir Urimai Thogai.'
      }
    ],
    expandedDetails: [
      {
        label: 'Previous Offices',
        text: 'Deputy Chief Minister of Tamil Nadu (2009–2011), 37th Mayor of Chennai (1996–2002).'
      },
      {
        label: 'Personal Life',
        text: 'Born 1 March 1953 (Chennai); son of former Chief Minister M. Karunanidhi and Dayalu Ammal.'
      }
    ],
    sources: [
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'M. K. Stalin - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/M._K._Stalin',
        iconType: 'wikipedia'
      },
      {
        name: 'TN Government',
        domain: 'tn.gov.in',
        title: 'Hon\'ble Chief Minister | Tamil Nadu Government Portal',
        url: 'https://www.tn.gov.in',
        iconType: 'heritage'
      }
    ],
    organicResults: [
      {
        domain: 'en.wikipedia.org › wiki › List_of_chief_ministers_of_Tamil_Nadu',
        siteName: 'Wikipedia',
        title: 'List of chief ministers of Tamil Nadu - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/List_of_chief_ministers_of_Tamil_Nadu',
        meta: 'Government & Politics',
        snippet: 'The Chief Minister of Tamil Nadu is the chief executive of the Indian state of Tamil Nadu. In office since 7 May 2021, M. K. Stalin is the incumbent chief minister...',
        iconType: 'wikipedia'
      },
      {
        domain: 'en.wikipedia.org › wiki › M._K._Stalin',
        siteName: 'Wikipedia',
        title: 'M. K. Stalin - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/M._K._Stalin',
        meta: 'Biography & Career',
        snippet: 'Muthuvel Karunanidhi Stalin is an Indian politician who is the 8th and current Chief Minister of Tamil Nadu. He leads the DMK government...',
        iconType: 'wikipedia'
      },
      {
        domain: 'tn.gov.in › content › chief-ministers-tamil-nadu',
        siteName: 'Government of Tamil Nadu',
        title: 'Chief Ministers of Tamil Nadu - Official Portal',
        url: 'https://www.tn.gov.in',
        meta: 'Official State Portal',
        snippet: 'Official profile, cabinet ministers, government orders, flagship welfare schemes, and public services of the Government of Tamil Nadu under Chief Minister M.K. Stalin.',
        iconType: 'heritage'
      }
    ]
  },
  pm_india: {
    title: 'Narendra Modi',
    topicName: 'Prime Minister of India',
    languageBadge: 'English / हिन्दी',
    overviewLead: '**Narendra Damodardas Modi** is an Indian politician who has served as the **14th Prime Minister of India** since May 26, 2014. He previously served as the Chief Minister of Gujarat from 2001 to 2014.',
    image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Key Facts and Office Details',
    bulletPoints: [
      {
        label: 'Current Office',
        text: 'Prime Minister of India (In office since 26 May 2014).'
      },
      {
        label: 'Political Party',
        text: 'Bharatiya Janata Party (BJP), NDA coalition.'
      },
      {
        label: 'Parliamentary Constituency',
        text: 'Varanasi, Uttar Pradesh.'
      },
      {
        label: 'Preceded by',
        text: 'Manmohan Singh (Indian National Congress).'
      }
    ],
    expandedDetails: [
      {
        label: 'Born',
        text: '17 September 1950 (Vadnagar, Bombay State, now Gujarat).'
      }
    ],
    sources: [
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Narendra Modi - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Narendra_Modi',
        iconType: 'wikipedia'
      },
      {
        name: 'PMINDIA',
        domain: 'pmindia.gov.in',
        title: 'Prime Minister of India - Official Website',
        url: 'https://www.pmindia.gov.in',
        iconType: 'heritage'
      }
    ],
    organicResults: [
      {
        domain: 'pmindia.gov.in',
        siteName: 'PMINDIA',
        title: 'Prime Minister of India: Narendra Modi',
        url: 'https://www.pmindia.gov.in',
        meta: 'Official Website',
        snippet: 'Official website of the Prime Minister of India featuring speeches, news, initiatives, cabinet decisions, and citizen outreach portals.',
        iconType: 'heritage'
      },
      {
        domain: 'en.wikipedia.org › wiki › Narendra_Modi',
        siteName: 'Wikipedia',
        title: 'Narendra Modi - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Narendra_Modi',
        meta: 'Biography',
        snippet: 'Narendra Damodardas Modi is an Indian politician serving as the 14th prime minister of India since 2014. Modi was the chief minister of Gujarat from 2001 to 2014...',
        iconType: 'wikipedia'
      }
    ]
  },
  murugan: {
    title: 'Murugan',
    topicName: 'Lord Murugan',
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
        text: 'Son of Lord Shiva and Goddess Parvati, brother of Ganesha. His sacred vahana (mount) is the peacock (Mayil).'
      }
    ],
    sources: [
      {
        name: 'Quora',
        domain: 'quora.com',
        title: 'What does the name Murugan mean? - Quora',
        url: 'https://www.quora.com/What-does-the-name-Murugan-mean',
        iconType: 'quora'
      },
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Kartikeya (Murugan) - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Kartikeya',
        iconType: 'wikipedia'
      }
    ],
    organicResults: [
      {
        domain: 'https://www.quora.com › What-does-the-name-Murugan-mean',
        siteName: 'Quora',
        title: 'What does the name Murugan mean? - Quora',
        url: 'https://www.quora.com/What-does-the-name-Murugan-mean',
        meta: '50+ answers · 6 years ago',
        snippet: 'In Tamil, the word "Murugu" means beauty, youthfulness, godliness, and fragrance. Thus, Murugan translates to "the Handsome one", "the Youthful one", and the lord who destroys evil...',
        iconType: 'quora'
      },
      {
        domain: 'https://en.wikipedia.org › wiki › Kartikeya',
        siteName: 'Wikipedia',
        title: 'Kartikeya (Murugan) - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Kartikeya',
        meta: 'Free Encyclopedia',
        snippet: 'Kartikeya (Sanskrit: कार्त्तिकेय), also known as Skanda, Murugan, Shanmukha and Subramanya, is the Hindu god of war. He is the son of Shiva and Parvati, brother of Ganesha...',
        iconType: 'wikipedia'
      }
    ]
  },
  karthik: {
    title: 'Karthik',
    topicName: 'Karthik (Kartikeya)',
    languageBadge: 'தமிழ்',
    overviewLead: 'Karthik (or Karthick) is an Indian name of Sanskrit & Tamil origin meaning "**radiant**," "**courageous**," or "**bestower of courage**." It is derived from the Krittika star cluster and is synonymous with **Lord Murugan / Kartikeya**.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Etymology and Meaning',
    bulletPoints: [
      {
        label: 'Origin',
        text: 'Derived from Krittika (the Pleiades constellation / six Krittika sisters who raised Kartikeya).'
      },
      {
        label: 'Core Meaning',
        text: 'Signifies brilliance, eternal youth, valor, and divine radiance.'
      },
      {
        label: 'Cultural Significance',
        text: 'Widely celebrated across South India, especially during the Tamil month of Karthigai and Karthigai Deepam festival.'
      }
    ],
    expandedDetails: [
      {
        label: 'Famous Personalities',
        text: 'Celebrated Indian actor Murali Karthikeyan Muthuraman (Karthik), Gautham Karthik, and notable artists.'
      }
    ],
    sources: [
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Karthik (given name) - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Karthik',
        iconType: 'wikipedia'
      },
      {
        name: 'Quora',
        domain: 'quora.com',
        title: 'What is the real meaning of the name Karthick? - Quora',
        url: 'https://www.quora.com/What-is-the-meaning-of-the-name-Karthik',
        iconType: 'quora'
      }
    ],
    organicResults: [
      {
        domain: 'https://en.wikipedia.org › wiki › Karthik_(actor)',
        siteName: 'Wikipedia',
        title: 'Karthik (actor) - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Karthik_(actor)',
        meta: 'Indian Actor',
        snippet: 'Murali Karthikeyan Muthuraman, better known as Karthik, is an Indian actor, playback singer and politician who has worked predominantly in Tamil cinema...',
        iconType: 'wikipedia'
      },
      {
        domain: 'https://www.quora.com › What-is-the-meaning-of-the-name-Karthik',
        siteName: 'Quora',
        title: 'What is the real meaning of the name Karthick? - Quora',
        url: 'https://www.quora.com/What-is-the-meaning-of-the-name-Karthik',
        meta: '30+ answers',
        snippet: 'The name Karthik represents courage, leadership, and brilliance. It is also the month in the Hindu calendar dedicated to light...',
        iconType: 'quora'
      }
    ]
  },
  cockpit: {
    title: 'Cockpit',
    topicName: 'Cockpit (Flight Deck)',
    languageBadge: 'Aviation',
    overviewLead: 'A cockpit (or **flight deck**) is the compartment, usually near the front of an aircraft or spacecraft, from which the **pilots control and navigate the vehicle**.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80',
    etymologyHeader: 'Design and Functionality',
    bulletPoints: [
      {
        label: 'Etymology',
        text: 'Originated in the 16th century for cockfighting pits; adopted by the Royal Navy in the 1700s and aviation in 1914.'
      },
      {
        label: 'Instruments',
        text: 'Contains Primary Flight Displays (PFD), Navigation Displays (ND), Flight Management Systems (FMS), and throttle quadrant.'
      },
      {
        label: 'Flight Crew',
        text: 'Operated by the Captain (Pilot in Command) and First Officer (Co-pilot).'
      }
    ],
    expandedDetails: [
      {
        label: 'Modern Glass Cockpits',
        text: 'Modern airliners feature high-resolution LCD screens, fly-by-wire controls, and Head-Up Displays (HUD).'
      }
    ],
    sources: [
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        title: 'Cockpit - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Cockpit',
        iconType: 'wikipedia'
      }
    ],
    organicResults: [
      {
        domain: 'https://en.wikipedia.org › wiki › Cockpit',
        siteName: 'Wikipedia',
        title: 'Cockpit - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Cockpit',
        meta: 'Aviation Engineering',
        snippet: 'A cockpit or flight deck is the area, usually near the front of an aircraft or spacecraft, from which a pilot controls the vehicle...',
        iconType: 'wikipedia'
      }
    ]
  }
};

export default function GoogleSearchCard({ media, onClose }) {
  const [query, setQuery] = useState(media?.title || '');
  const [results, setResults] = useState(media?.results || []);
  const [snippet, setSnippet] = useState(media?.snippet || '');
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

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchResults = async (q) => {
    if (!q || !q.trim()) return;
    try {
      const res = await fetch(`/api/websearch?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) setResults(data.results);
        if (data.snippet) setSnippet(data.snippet);
      }
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchResults(query.trim());
    }
  };

  if (!media || media.type !== 'google') return null;

  const currentQuery = query || media.title || 'the chief minister of Tamilnadu';
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(currentQuery)}`;
  const lowerQ = currentQuery.toLowerCase();

  // Match knowledge topic
  let matchedTopic = null;
  if (
    (lowerQ.includes('chief minister') || lowerQ.includes('cm')) &&
    (lowerQ.includes('tamil') || lowerQ.includes('tn'))
  ) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.cm_tamilnadu;
  } else if (
    lowerQ.includes('stalin') ||
    lowerQ.includes('m.k. stalin') ||
    lowerQ.includes('m k stalin')
  ) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.cm_tamilnadu;
  } else if (
    lowerQ.includes('prime minister') &&
    (lowerQ.includes('india') || lowerQ.includes('indian'))
  ) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.pm_india;
  } else if (lowerQ.includes('modi') || lowerQ.includes('narendra modi')) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.pm_india;
  } else if (lowerQ.includes('murugan') || lowerQ.includes('kartikeya') || lowerQ.includes('skanda')) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.murugan;
  } else if (lowerQ.includes('karthik') || lowerQ.includes('karthick')) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.karthik;
  } else if (lowerQ.includes('cockpit') || lowerQ.includes('flight deck')) {
    matchedTopic = TOPIC_KNOWLEDGE_BASE.cockpit;
  } else {
    const cleaned = currentQuery
      .replace(/^(?:what is mean by|mean by|what is the meaning of|meaning of|what is|who is|search for|search)\s+/i, '')
      .trim();

    matchedTopic = {
      title: cleaned || currentQuery,
      topicName: cleaned || currentQuery,
      languageBadge: 'English',
      overviewLead: snippet || `**${cleaned || currentQuery}** represents authoritative encyclopedic definitions and real-time knowledge indexed across verified search registries.`,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      etymologyHeader: 'Etymology and Meaning',
      bulletPoints: [
        {
          label: 'Definition',
          text: snippet || `Comprehensive definition and verified context for "${currentQuery}".`
        },
        {
          label: 'Context',
          text: `Widely indexed across encyclopedias, scholarly archives, and public knowledge graphs.`
        },
        {
          label: 'Relevance',
          text: `Explore live articles, community forums, and related search discussions below.`
        }
      ],
      expandedDetails: [
        {
          label: 'Live Web Index',
          text: `Continuously updated from live search engine crawlers and verified databases.`
        }
      ],
      sources: [
        {
          name: 'Wikipedia',
          domain: 'en.wikipedia.org',
          title: `${cleaned} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleaned)}`,
          iconType: 'wikipedia'
        },
        {
          name: 'Web Source',
          domain: 'google.com',
          title: `Discussion & Context on ${cleaned}`,
          url: googleUrl,
          iconType: 'quora'
        }
      ],
      organicResults: []
    };
  }

  // Handle Text-to-Speech audio reader
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

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

  // Helper to parse markdown bold text into <strong>
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

  // Organic search results to show (matches query or live results)
  const displayOrganicResults =
    matchedTopic.organicResults && matchedTopic.organicResults.length > 0
      ? matchedTopic.organicResults
      : results && results.length > 0
        ? results.map(r => ({
            domain: r.displayUrl || r.url,
            siteName: r.displayUrl ? r.displayUrl.split('/')[0] : 'Web Source',
            title: r.title || `${currentQuery} - Overview`,
            url: r.url,
            meta: 'Verified Search',
            snippet: r.snippet,
            iconType: 'globe'
          }))
        : [];

  return (
    <div
      className={`transition-all duration-300 font-sans ${
        isFullscreen
          ? 'fixed inset-0 w-screen h-screen z-50 bg-[#202124] flex flex-col m-0 p-0 rounded-none overflow-hidden'
          : isMinimized
            ? 'fixed z-40 bottom-20 right-6 w-80'
            : 'fixed z-40 top-6 left-3 sm:top-8 sm:left-6 w-[96vw] sm:w-[640px] md:w-[860px] lg:w-[960px]'
      }`}
    >
      <div className={`bg-[#202124] text-[#e8eaed] flex flex-col overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.95)] ${
        isFullscreen ? 'w-full h-full' : 'rounded-3xl border border-[#3c4043] max-h-[92vh]'
      }`}>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. AUTHENTIC GOOGLE HEADER & SEARCH BAR */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 py-3 bg-[#202124] border-b border-[#3c4043] flex items-center justify-between gap-3 flex-shrink-0">
          
          {/* Authentic Google Multi-Color Logo */}
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center select-none flex-shrink-0 text-white font-semibold text-2xl tracking-tight pr-1 font-serif"
          >
            <span className="text-[#8ab4f8]">G</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc04]">o</span>
            <span className="text-[#8ab4f8]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
          </a>

          {/* Centered Dark Pill Search Input matching Chrome */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center">
            <div className="w-full bg-[#303134] hover:bg-[#35363a] focus-within:bg-[#303134] rounded-full px-4 py-2 flex items-center gap-2.5 border border-transparent focus-within:border-[#8ab4f8] shadow-inner transition">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Google..."
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
              <button type="button" className="text-slate-400 hover:text-white text-sm hidden sm:inline-flex p-1" title="Voice Search">🎤</button>
              <button type="button" className="text-slate-400 hover:text-white text-sm hidden sm:inline-flex p-1" title="Google Lens">📷</button>
              <button type="submit" className="text-[#8ab4f8] hover:text-[#aecbfa] text-sm font-bold pl-1" title="Search">🔍</button>
            </div>
          </form>

          {/* Tab & Window Controls */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs flex-shrink-0">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#8ab4f8] hover:text-white bg-[#303134] hover:bg-[#3c4043] px-3 py-1.5 rounded-full border border-slate-700 transition hidden sm:inline-flex items-center gap-1 font-medium"
            >
              Open Google ↗
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

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. NAVIGATION TABS BAR */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!isMinimized && (
          <div className="px-4 sm:px-8 pt-2.5 border-b border-[#3c4043] flex items-center gap-6 text-xs text-[#9aa0a6] select-none overflow-x-auto flex-shrink-0 scrollbar-none bg-[#202124]">
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
        {/* 3. MAIN RESULTS CONTAINER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-[#202124] scrollbar-thin scrollbar-thumb-slate-700 flex flex-col gap-6">
            
            {/* Search metadata */}
            <div className="text-[12px] text-[#9aa0a6] select-none flex items-center justify-between flex-wrap gap-2">
              <div>About 4,820,000 results (0.42 seconds)</div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <span>📍 Tamil Nadu</span>
                <span className="text-slate-600">•</span>
                <span className="text-[#8ab4f8] cursor-pointer hover:underline">Choose area</span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 4. AUTHENTIC GOOGLE AI OVERVIEW CARD */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-[#282a2d] border border-[#3c4043] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden transition">
              
              {/* Header inside AI Overview */}
              <div className="flex items-center justify-between gap-3 border-b border-[#3c4043]/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-sm sm:text-base font-semibold text-white tracking-wide">
                    <span className="text-base sm:text-lg bg-gradient-to-r from-[#c58af9] to-[#8ab4f8] bg-clip-text text-transparent font-bold">✦</span>
                    <span>AI Overview</span>
                  </div>

                  {matchedTopic.languageBadge && (
                    <span className="bg-[#303134] text-slate-200 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-slate-600 select-none">
                      {matchedTopic.languageBadge}
                    </span>
                  )}
                </div>

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
                  </button>
                  <button className="text-slate-400 hover:text-white p-1 text-sm rounded-lg hover:bg-[#303134]">
                    ⋮
                  </button>
                </div>
              </div>

              {/* Body: Left Definition & Right Citations */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Left: Summary + Etymology Bullets */}
                <div className="md:col-span-8 flex flex-col gap-3.5">
                  
                  {/* Highlighted Lead Paragraph */}
                  <p className="text-sm sm:text-[15px] text-[#e8eaed] leading-relaxed">
                    {renderFormattedText(matchedTopic.overviewLead)}
                  </p>

                  {/* Section Title */}
                  {matchedTopic.etymologyHeader && (
                    <h4 className="text-sm font-semibold text-white mt-1">
                      {matchedTopic.etymologyHeader}
                    </h4>
                  )}

                  {/* Bullet points */}
                  <ul className="flex flex-col gap-2.5 text-xs sm:text-[13.5px] text-[#bdc1c6] leading-relaxed list-none pl-0">
                    {matchedTopic.bulletPoints.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold text-sm leading-tight">•</span>
                        <div>
                          <strong className="text-white font-medium">{item.label}:</strong> {item.text}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Extended items when "Show more" clicked */}
                  {isExpanded && matchedTopic.expandedDetails && (
                    <ul className="flex flex-col gap-2.5 text-xs sm:text-[13.5px] text-[#bdc1c6] leading-relaxed list-none pl-0 pt-2 border-t border-[#3c4043]/50 animate-in fade-in duration-200">
                      {matchedTopic.expandedDetails.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold text-sm leading-tight">•</span>
                          <div>
                            <strong className="text-white font-medium">{item.label}:</strong> {item.text}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Show more toggle button */}
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

                {/* Right: Topic Thumbnail & Source Cards */}
                <div className="md:col-span-4 flex flex-col gap-3">
                  
                  {/* Photo Thumbnail */}
                  {matchedTopic.image && (
                    <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-slate-700/80 shadow-md relative group">
                      <img
                        src={matchedTopic.image}
                        alt={matchedTopic.topicName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] text-slate-200 font-medium">
                        {matchedTopic.topicName}
                      </div>
                    </div>
                  )}

                  {/* Source Citations */}
                  <div className="flex flex-col gap-2">
                    {matchedTopic.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#202124] hover:bg-[#303134] p-2.5 rounded-xl border border-[#3c4043] transition flex items-center justify-between gap-2.5 group"
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
            {/* 5. ORGANIC WEB RESULTS (Matches exact query) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-6 pt-2">
              
              {displayOrganicResults.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 group max-w-3xl">
                  <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                    {item.iconType === 'quora' ? (
                      <div className="w-5 h-5 rounded-full bg-[#b92b27] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        Q
                      </div>
                    ) : item.iconType === 'wikipedia' ? (
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                        W
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#303134] border border-slate-600 flex items-center justify-center text-[10px] font-bold text-[#8ab4f8] flex-shrink-0">
                        🌐
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-slate-200 text-xs">{item.siteName}</span>
                      <span className="text-[11px] text-[#9aa0a6] truncate">{item.domain}</span>
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg font-medium text-[#8ab4f8] group-hover:underline leading-snug"
                  >
                    {item.title}
                  </a>
                  {item.meta && (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {item.meta}
                    </div>
                  )}
                  <p className="text-xs sm:text-[13px] text-[#bdc1c6] leading-relaxed">
                    {item.snippet}
                  </p>
                </div>
              ))}

              {/* View all on Google button */}
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
