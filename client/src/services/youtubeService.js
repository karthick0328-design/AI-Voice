/**
 * YouTube Service - Resolves song queries to real, playable YouTube Video IDs
 * dynamically via serverless backend with zero CORS issues.
 */

const POPULAR_SONGS_MAP = {
  'kalyani': 'z5y8Clp_TdE',
  'ridhima': 'jR3rWCBeO6M',
  'the lady': 'GoGl1pT0TSM',
  'na ready': '3wDiqlTNlfQ',
  'leo': '3wDiqlTNlfQ',
  'arabic kuthu': '8FAUEv_E_x4',
  'vaathi coming': 'v0q3b7K_iJU',
  'kaavaalaa': 'lZRAWq0FkXU',
  'despacito': 'kJQP7kiw5Fk',
  'shape of you': 'JGwWNGJdvx8',
  'believer': '7wtfhZwyrcc',
  'stay': 'kTJczUoc26U',
  'blinding lights': '4NRXx6U8ABQ',
  'faded': '60ItHLz5WEA',
  'badass': 'yZk4u4N04tA',
  'hukum': '1F3HM635S0k',
  'chaleya': 'VAdGW7QDJiU',
  'jawan': 'VAdGW7QDJiU',
  'tum hi ho': 'IJq0yyWug1k',
  'kesariya': 'BddP6PYo2gs'
};

export class YouTubeService {
  static async resolveVideoId(query) {
    const clean = (query || '').toLowerCase().trim();
    if (!clean) return 'z5y8Clp_TdE';

    // 1. First, call the serverless search endpoint (server-side, zero CORS)
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.videoId) {
          console.log(`[YouTubeService] Resolved "${query}" -> ${data.videoId} (${data.title})`);
          return data.videoId;
        }
      }
    } catch (e) {
      console.warn('[YouTubeService] Serverless search note:', e.message);
    }

    // 2. Check local mapping fallback
    for (const [key, id] of Object.entries(POPULAR_SONGS_MAP)) {
      if (clean.includes(key)) {
        return id;
      }
    }

    // 3. Fallback default
    return 'z5y8Clp_TdE';
  }
}
