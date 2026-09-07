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

const PLAYLIST_TRACKS = [
  { title: 'The Lady (Trending Acoustic)', id: 'GoGl1pT0TSM' },
  { title: 'Kalyani Theme Music', id: 'z5y8Clp_TdE' },
  { title: 'Ridhima Acoustic', id: 'jR3rWCBeO6M' },
  { title: 'Leo - Naa Ready', id: '3wDiqlTNlfQ' },
  { title: 'Arabic Kuthu - Beast', id: '8FAUEv_E_x4' },
  { title: 'Kaavaalaa - Jailer', id: 'lZRAWq0FkXU' },
  { title: 'Hukum - Thalaivar Alappara', id: '1F3HM635S0k' },
  { title: 'Badass - Leo', id: 'yZk4u4N04tA' },
  { title: 'Chaleya - Jawan', id: 'VAdGW7QDJiU' },
  { title: 'Kesariya - Brahmastra', id: 'BddP6PYo2gs' },
  { title: 'Blinding Lights - The Weeknd', id: '4NRXx6U8ABQ' },
  { title: 'Shape of You - Ed Sheeran', id: 'JGwWNGJdvx8' },
  { title: 'Believer - Imagine Dragons', id: '7wtfhZwyrcc' },
  { title: 'Stay - Kid LAROI & Justin Bieber', id: 'kTJczUoc26U' },
  { title: 'Faded - Alan Walker', id: '60ItHLz5WEA' }
];

export class YouTubeService {
  static async resolveVideoId(query) {
    const clean = (query || '').toLowerCase().trim();
    if (!clean) return 'GoGl1pT0TSM';

    // 1. Check local quick mapping first for fast matching
    for (const [key, id] of Object.entries(POPULAR_SONGS_MAP)) {
      if (clean.includes(key)) {
        return id;
      }
    }

    // 2. Call the serverless search endpoint (server-side, zero CORS)
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

    // 3. Fallback default
    return 'GoGl1pT0TSM';
  }

  static async resolveNextVideo(currentVideoId, currentTitle = '', playedIds = []) {
    // 1. Clean current title to form related music query
    let clean = (currentTitle || '')
      .replace(/\(official.+?\)/gi, '')
      .replace(/\[official.+?\]/gi, '')
      .replace(/\(music video\)/gi, '')
      .replace(/\(video song\)/gi, '')
      .replace(/\(lyric video\)/gi, '')
      .replace(/ft\..+$/gi, '')
      .replace(/feat\..+$/gi, '')
      .replace(/#\w+/g, '')
      .replace(/@\w+/g, '')
      .replace(/[\|\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean || clean.length < 3) clean = 'trending music songs';
    const relatableQuery = `${clean} similar songs`;

    // 2. Fetch related search results from YouTube
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(relatableQuery)}&exclude=${currentVideoId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          // Find first result that isn't the current video and hasn't been played
          const candidate = data.results.find(
            r => r.videoId !== currentVideoId && !playedIds.includes(r.videoId)
          ) || data.results.find(r => r.videoId !== currentVideoId) || data.results[0];

          if (candidate && candidate.videoId) {
            console.log(`[YouTubeService] Found relatable next track: "${candidate.title}" (${candidate.videoId}) for query "${clean}"`);
            return {
              id: candidate.videoId,
              title: candidate.title
            };
          }
        }
      }
    } catch (e) {
      console.warn('[YouTubeService] Relatable search error:', e.message);
    }

    // 3. Fallback to curated playlist tracks
    const curIdx = PLAYLIST_TRACKS.findIndex(t => t.id === currentVideoId);
    let nextIdx = (curIdx + 1) % PLAYLIST_TRACKS.length;
    if (nextIdx < 0) nextIdx = 0;
    return PLAYLIST_TRACKS[nextIdx];
  }

  static getPlaylist() {
    return PLAYLIST_TRACKS;
  }
}
