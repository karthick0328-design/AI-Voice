/**
 * YouTube Service - Resolves song queries to real, playable YouTube Video IDs
 * with multiple high-speed CORS proxies and fallbacks.
 */

// Popular fallback mapping for instant 0ms playback of top songs
const POPULAR_SONGS_MAP = {
  'kalyani': 'z5y8Clp_TdE',
  'kalyani song': 'z5y8Clp_TdE',
  'a kalyani song': 'z5y8Clp_TdE',
  'na ready': '3wDiqlTNlfQ',
  'na ready song': '3wDiqlTNlfQ',
  'leo': '3wDiqlTNlfQ',
  'arabic kuthu': '8FAUEv_E_x4',
  'vaathi coming': 'v0q3b7K_iJU',
  'kaavaalaa': 'lZRAWq0FkXU',
  'despacito': 'kJQP7kiw5Fk',
  'shape of you': 'JGwWNGJdvx8',
  'believer': '7wtfhZwyrcc',
  'stay': 'kTJczUoc26U',
  'blinding lights': '4NRXx6U8ABQ',
  'faded': '60ItHLz5WEA'
};

export class YouTubeService {
  /**
   * Resolve a query string to a working YouTube video ID
   */
  static async resolveVideoId(query) {
    const clean = (query || '').toLowerCase().trim();
    if (!clean) return 'z5y8Clp_TdE'; // Default Kalyani song

    // 1. Check instant local song cache
    for (const [key, id] of Object.entries(POPULAR_SONGS_MAP)) {
      if (clean.includes(key)) {
        console.log(`[YouTubeService] Instant cache hit for "${key}":`, id);
        return id;
      }
    }

    // 2. Try Invidious public API instances
    const invidiousInstances = [
      'https://inv.tux.pizza',
      'https://invidious.nerdvpn.de',
      'https://yewtu.be',
      'https://invidious.private.coffee'
    ];

    for (const instance of invidiousInstances) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(
          `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].videoId) {
            console.log(`[YouTubeService] Found videoId via ${instance}:`, data[0].videoId);
            return data[0].videoId;
          }
        }
      } catch (e) {}
    }

    // 3. Try CORS proxy search
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        )}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const html = json.contents || '';
        const idMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (idMatch && idMatch[1]) {
          console.log(`[YouTubeService] Found videoId via proxy:`, idMatch[1]);
          return idMatch[1];
        }
      }
    } catch (e) {}

    // 4. Fallback default top video
    return 'z5y8Clp_TdE';
  }
}
