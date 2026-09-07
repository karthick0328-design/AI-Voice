import { puppeteerService } from '../services/browser/PuppeteerService.js';

/**
 * YouTube Controller - Handles search and media control without CORS issues
 */
export async function searchYouTube(req, res) {
  try {
    const query = req.query.q || req.body.query || '';
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Direct YouTube search fetch on server-side (no CORS limitation)
    const response = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      }
    );

    const html = await response.text();
    let videoId = null;
    let title = query;

    const idMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (idMatch && idMatch[1]) {
      videoId = idMatch[1];
    } else {
      const watchMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (watchMatch && watchMatch[1]) {
        videoId = watchMatch[1];
      }
    }

    const titleMatch = html.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}/);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1];
    }

    if (!videoId) {
      videoId = 'z5y8Clp_TdE'; // Fallback
    }

    return res.json({
      success: true,
      query,
      videoId,
      title,
      url: `https://www.youtube.com/watch?v=${videoId}`
    });
  } catch (error) {
    console.error('[YouTubeController] search error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      videoId: 'z5y8Clp_TdE',
      url: 'https://www.youtube.com/watch?v=z5y8Clp_TdE'
    });
  }
}

export async function executeControl(req, res) {
  try {
    const { action, seconds, volume, rate, query } = req.body;
    let result = null;

    switch (action) {
      case 'play':
      case 'resume':
        result = await puppeteerService.resumeVideo();
        break;
      case 'pause':
      case 'stop':
        result = await puppeteerService.pauseVideo();
        break;
      case 'restart':
        result = await puppeteerService.restartVideo();
        break;
      case 'next':
        result = await puppeteerService.nextVideo();
        break;
      case 'previous':
        result = await puppeteerService.previousVideo();
        break;
      case 'seek_forward':
        result = await puppeteerService.seekVideo(seconds || 10, 'forward');
        break;
      case 'seek_backward':
        result = await puppeteerService.seekVideo(seconds || 10, 'backward');
        break;
      case 'seek_to':
        result = await puppeteerService.seekTo(seconds || 0);
        break;
      case 'mute':
        result = await puppeteerService.muteVideo();
        break;
      case 'unmute':
        result = await puppeteerService.unmuteVideo();
        break;
      case 'volume_up':
        result = await puppeteerService.volumeUp(volume || 0.15);
        break;
      case 'volume_down':
        result = await puppeteerService.volumeDown(volume || 0.15);
        break;
      case 'set_volume':
        result = await puppeteerService.setVolume(volume ?? 50);
        break;
      case 'fullscreen':
        result = await puppeteerService.enableFullscreen();
        break;
      case 'exit_fullscreen':
        result = await puppeteerService.exitFullscreen();
        break;
      case 'set_playback_rate':
        result = await puppeteerService.setPlaybackRate(rate || 1.0);
        break;
      case 'captions_on':
        result = await puppeteerService.captionsOn();
        break;
      case 'captions_off':
        result = await puppeteerService.captionsOff();
        break;
      case 'current_status':
        result = await puppeteerService.getVideoStatus();
        break;
      default:
        result = { success: false, reason: `Unknown action: ${action}` };
    }

    const currentStatus = await puppeteerService.getVideoStatus();
    return res.json({
      success: true,
      actionResult: result,
      status: currentStatus
    });
  } catch (error) {
    console.error('[YouTubeController] control error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getStatus(req, res) {
  try {
    const status = await puppeteerService.getVideoStatus();
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
