/**
 * PuppeteerService - REAL BROWSER + FULL YOUTUBE MEDIA CONTROL
 *
 * Launches Chrome as a genuine OS process (child_process.spawn) with
 * --remote-debugging-port=9222 and connects Puppeteer via CDP.
 * YouTube never sees any automation flag — full playback, no 40s stop.
 *
 * Re-attaches instantly to already running Chrome if available.
 */

import puppeteerVanilla from 'puppeteer';
import { spawn } from 'child_process';

const CHROME_EXE  = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT  = 9222;
const PROFILE_DIR = 'e:\\AI Voice\\chrome-profile-ai';

class PuppeteerService {
  constructor() {
    this.browser       = null;
    this.page          = null;
    this.chromeProcess = null;
  }

  // ─── Connect to Chrome (auto-reconnects to running instance) ───────────────
  async getPage() {
    // 1. If we already have a connected browser & valid page in memory
    if (this.browser && this.browser.isConnected()) {
      try {
        const pages = await this.browser.pages();
        const activePage = pages.find(p => p.url().includes('youtube.com')) ||
                           pages.find(p => !p.url().startsWith('about:') && !p.url().startsWith('chrome://')) ||
                           pages[pages.length - 1];
        if (activePage && !activePage.isClosed()) {
          this.page = activePage;
          console.log(`[BROWSER] Reusing active page — url: ${this.page.url()}`);
          return this.page;
        }
      } catch (e) {
        this.browser = null;
        this.page    = null;
      }
    }

    // 2. Try to connect to an ALREADY RUNNING Chrome on port 9222
    try {
      console.log('[BROWSER] Checking for existing Chrome on port 9222...');
      this.browser = await puppeteerVanilla.connect({
        browserURL: `http://localhost:${DEBUG_PORT}`,
        defaultViewport: null
      });
      console.log('[BROWSER] Connected to existing Chrome instance!');
      const pages = await this.browser.pages();
      const activePage = pages.find(p => p.url().includes('youtube.com')) ||
                         pages.find(p => !p.url().startsWith('about:') && !p.url().startsWith('chrome://')) ||
                         pages[pages.length - 1];
      this.page = activePage || await this.browser.newPage();
      try { await this.page.bringToFront(); } catch (e) {}
      console.log(`[BROWSER] Active page URL: ${this.page.url()}`);
      return this.page;
    } catch (connectErr) {
      console.log('[BROWSER] No active Chrome on port 9222. Launching new Chrome process...');
    }

    // 3. Launch Chrome as a REAL system process if not running
    this.chromeProcess = spawn(CHROME_EXE, [
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${PROFILE_DIR}`,
      '--start-maximized',
      '--no-first-run',
      '--no-default-browser-check',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      'about:blank'
    ], { detached: false, stdio: 'ignore' });

    this.chromeProcess.on('error', (err) => {
      console.error('[BROWSER ERROR] Chrome process error:', err.message);
    });

    console.log('[BROWSER] Chrome process started, PID:', this.chromeProcess.pid);

    await this._waitForDebugPort(DEBUG_PORT, 10000);
    console.log('[BROWSER] Remote debugging port is ready');

    this.browser = await puppeteerVanilla.connect({
      browserURL: `http://localhost:${DEBUG_PORT}`,
      defaultViewport: null
    });
    console.log('[BROWSER] Puppeteer connected to Chrome');

    const pages = await this.browser.pages();
    this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();
    try { await this.page.bringToFront(); } catch (e) {}

    console.log(`[BROWSER] Page created — URL: ${this.page.url()}`);
    return this.page;
  }

  async _waitForDebugPort(port, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await fetch(`http://localhost:${port}/json/version`);
        if (res.ok) return;
      } catch (e) { /* waiting */ }
      await new Promise(r => setTimeout(r, 200));
    }
    throw new Error(`Chrome debug port ${port} did not open within ${timeoutMs}ms`);
  }

  async close() {
    if (this.browser) {
      try { this.browser.disconnect(); } catch (e) {}
      this.browser = null;
      this.page    = null;
    }
    if (this.chromeProcess) {
      try { this.chromeProcess.kill(); } catch (e) {}
      this.chromeProcess = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIA CONTROLS — Direct execution on active YouTube player
  // ═══════════════════════════════════════════════════════════════════════════

  async getVideoStatus() {
    try {
      const page = await this.getPage();
      const status = await page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return { connected: true, hasVideo: false };
        const titleEl = document.querySelector('h1 .ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer yt-formatted-string');
        return {
          connected: true,
          hasVideo: true,
          playing: !video.paused && !video.ended,
          paused: video.paused,
          ended: video.ended,
          currentTime: video.currentTime,
          duration: video.duration,
          muted: video.muted,
          volume: video.volume,
          playbackRate: video.playbackRate,
          url: window.location.href,
          title: titleEl ? titleEl.textContent.trim() : document.title
        };
      });
      console.log(`[MEDIA] Current video: ${status.title || 'unknown'} (playing: ${status.playing})`);
      return status;
    } catch (e) {
      return { connected: false, error: e.message };
    }
  }

  async pauseVideo() {
    console.log('[MEDIA] Pause requested');
    const page = await this.getPage();
    const result = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.pause();
        return { success: true, paused: video.paused, currentTime: video.currentTime };
      }
      return { success: false, reason: 'NO_VIDEO_ELEMENT' };
    });
    console.log(`[MEDIA] Pause executed:`, result);
    return result;
  }

  async resumeVideo() {
    console.log('[MEDIA] Resume requested');
    const page = await this.getPage();
    const result = await page.evaluate(async () => {
      const video = document.querySelector('video');
      if (video) {
        try {
          await video.play();
        } catch (e) {
          const playBtn = document.querySelector('.ytp-play-button');
          if (playBtn) playBtn.click();
        }
        return { success: true, paused: video.paused };
      }
      return { success: false, reason: 'NO_VIDEO_ELEMENT' };
    });
    console.log(`[MEDIA] Resume executed:`, result);
    return result;
  }

  async seekVideo(seconds, direction = 'forward') {
    const delta = direction === 'backward' ? -Math.abs(seconds) : Math.abs(seconds);
    console.log(`[MEDIA] Seek ${direction}: ${Math.abs(seconds)}s`);
    const page = await this.getPage();
    const result = await page.evaluate((d) => {
      // 1. Use YouTube's official player API if available
      const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
      if (player && typeof player.seekBy === 'function') {
        player.seekBy(d);
        const currentT = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : null;
        return { success: true, method: 'player_seekBy', delta: d, currentTime: currentT };
      }
      // 2. Direct HTML5 video fallback
      const video = document.querySelector('video');
      if (!video) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      const before = video.currentTime;
      video.currentTime = Math.max(0, video.currentTime + d);
      return { success: true, method: 'video_currentTime', before, after: video.currentTime };
    }, delta);
    console.log(`[MEDIA] Seek executed:`, result);
    return result;
  }

  async seekTo(targetSeconds) {
    console.log(`[MEDIA] Seek to: ${targetSeconds}s`);
    const page = await this.getPage();
    const result = await page.evaluate((t) => {
      const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
      if (player && typeof player.seekTo === 'function') {
        player.seekTo(t, true);
        return { success: true, method: 'player_seekTo', target: t };
      }
      const video = document.querySelector('video');
      if (!video) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      video.currentTime = t;
      return { success: true, currentTime: video.currentTime };
    }, targetSeconds);
    return result;
  }

  async restartVideo() {
    console.log('[MEDIA] Restart requested');
    const page = await this.getPage();
    const result = await page.evaluate(async () => {
      const video = document.querySelector('video');
      if (!video) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      video.currentTime = 0;
      await video.play().catch(() => {});
      return { success: true, currentTime: video.currentTime };
    });
    return result;
  }

  async nextVideo() {
    console.log('[MEDIA] Next video requested');
    const page = await this.getPage();
    const urlBefore = page.url();
    const clicked = await page.evaluate(() => {
      const nextBtn = document.querySelector('.ytp-next-button');
      if (nextBtn) { nextBtn.click(); return 'player-next'; }
      const sidebarNext = document.querySelector('ytd-compact-video-renderer a#thumbnail');
      if (sidebarNext) { sidebarNext.click(); return 'sidebar-next'; }
      return null;
    });
    if (!clicked) return { success: false, reason: 'NEXT_BUTTON_NOT_FOUND' };
    await new Promise(r => setTimeout(r, 2500));
    await this.verifyYouTubePlayback(page);
    return { success: true, from: urlBefore, to: page.url() };
  }

  async previousVideo() {
    console.log('[MEDIA] Previous video requested');
    const page = await this.getPage();
    const urlBefore = page.url();
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));
    await this.verifyYouTubePlayback(page);
    return { success: true, from: urlBefore, to: page.url() };
  }

  async muteVideo() {
    console.log('[MEDIA] Mute requested');
    const page = await this.getPage();
    return await page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      v.muted = true;
      return { success: true, muted: true };
    });
  }

  async unmuteVideo() {
    console.log('[MEDIA] Unmute requested');
    const page = await this.getPage();
    return await page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      v.muted = false;
      return { success: true, muted: false };
    });
  }

  async volumeUp(amount = 0.2) {
    console.log(`[MEDIA] Volume up: +${amount}`);
    const page = await this.getPage();
    const result = await page.evaluate((amt) => {
      const v = document.querySelector('video');
      if (!v) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      v.muted = false;
      v.volume = Math.min(1.0, v.volume + amt);
      return { success: true, volume: v.volume };
    }, amount);
    console.log(`[MEDIA] Volume up result:`, result);
    return result;
  }

  async volumeDown(amount = 0.2) {
    console.log(`[MEDIA] Volume down: -${amount}`);
    const page = await this.getPage();
    const result = await page.evaluate((amt) => {
      const v = document.querySelector('video');
      if (!v) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      v.volume = Math.max(0.0, v.volume - amt);
      return { success: true, volume: v.volume };
    }, amount);
    console.log(`[MEDIA] Volume down result:`, result);
    return result;
  }

  async setVolume(level) {
    const normalized = Math.min(1, Math.max(0, level > 1 ? level / 100 : level));
    console.log(`[MEDIA] Set volume: ${normalized}`);
    const page = await this.getPage();
    const result = await page.evaluate((val) => {
      const v = document.querySelector('video');
      if (!v) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      v.muted = false;
      v.volume = val;
      return { success: true, volume: v.volume };
    }, normalized);
    return result;
  }

  async enableFullscreen() {
    console.log('[MEDIA] Fullscreen requested');
    const page = await this.getPage();
    const result = await page.evaluate(() => {
      const btn = document.querySelector('.ytp-fullscreen-button');
      if (btn) {
        btn.click();
        return { success: true, method: 'button_click' };
      }
      const v = document.querySelector('video');
      if (v && v.requestFullscreen) {
        v.requestFullscreen();
        return { success: true, method: 'requestFullscreen' };
      }
      return { success: false, reason: 'FULLSCREEN_NOT_AVAILABLE' };
    });
    console.log(`[MEDIA] Fullscreen result:`, result);
    return result;
  }

  async exitFullscreen() {
    console.log('[MEDIA] Exit fullscreen requested');
    const page = await this.getPage();
    const result = await page.evaluate(() => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
        return { success: true, method: 'exitFullscreen' };
      }
      const btn = document.querySelector('.ytp-fullscreen-button');
      if (btn) {
        btn.click();
        return { success: true, method: 'button_click' };
      }
      return { success: true };
    });
    return result;
  }

  async setPlaybackRate(rate) {
    console.log(`[MEDIA] Set playback rate: ${rate}x`);
    const page = await this.getPage();
    return await page.evaluate((r) => {
      const v = document.querySelector('video');
      if (!v) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
      v.playbackRate = r;
      return { success: true, playbackRate: v.playbackRate };
    }, rate);
  }

  async captionsOn() {
    const page = await this.getPage();
    return await page.evaluate(() => {
      const btn = document.querySelector('.ytp-subtitles-button');
      if (btn && btn.getAttribute('aria-pressed') !== 'true') btn.click();
      return { success: true };
    });
  }

  async captionsOff() {
    const page = await this.getPage();
    return await page.evaluate(() => {
      const btn = document.querySelector('.ytp-subtitles-button');
      if (btn && btn.getAttribute('aria-pressed') === 'true') btn.click();
      return { success: true };
    });
  }

  async scrollDown(pixels = 400) {
    const page = await this.getPage();
    await page.evaluate((px) => window.scrollBy(0, px), pixels);
    return { success: true };
  }

  async scrollUp(pixels = 400) {
    const page = await this.getPage();
    await page.evaluate((px) => window.scrollBy(0, -px), pixels);
    return { success: true };
  }

  async scrollToComments() {
    const page = await this.getPage();
    await page.evaluate(() => {
      const comments = document.querySelector('#comments, ytd-comments');
      if (comments) comments.scrollIntoView({ behavior: 'smooth' });
      else window.scrollBy(0, 800);
    });
    return { success: true };
  }

  async likeVideo() {
    const page = await this.getPage();
    return await page.evaluate(() => {
      const btn = document.querySelector('like-button-view-model button, button[aria-label*="like"]');
      if (btn) { btn.click(); return { success: true }; }
      return { success: false, reason: 'LIKE_BUTTON_NOT_FOUND' };
    });
  }

  async unlikeVideo() {
    const page = await this.getPage();
    return await page.evaluate(() => {
      const btn = document.querySelector('like-button-view-model button[aria-pressed="true"], button[aria-label*="like"][aria-pressed="true"]');
      if (btn) { btn.click(); return { success: true }; }
      return { success: false, reason: 'NOT_LIKED' };
    });
  }

  async subscribeChannel() {
    const page = await this.getPage();
    return await page.evaluate(() => {
      const btn = document.querySelector('ytd-subscribe-button-renderer button');
      if (btn && !btn.textContent.toLowerCase().includes('subscribed')) { btn.click(); return { success: true }; }
      return { success: false, reason: 'ALREADY_SUBSCRIBED_OR_NOT_FOUND' };
    });
  }

  async unsubscribeChannel() {
    const page = await this.getPage();
    return await page.evaluate(() => {
      const btn = document.querySelector('ytd-subscribe-button-renderer button');
      if (btn && btn.textContent.toLowerCase().includes('subscribed')) { btn.click(); return { success: true }; }
      return { success: false, reason: 'NOT_SUBSCRIBED_OR_NOT_FOUND' };
    });
  }

  async browserBack() {
    const page = await this.getPage();
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    return { success: true, url: page.url() };
  }

  async browserForward() {
    const page = await this.getPage();
    await page.goForward({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    return { success: true, url: page.url() };
  }

  // ─── URL helpers ──────────────────────────────────────────────────────────
  isYouTubePage(url) {
    if (!url) return false;
    return url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be');
  }

  isGooglePage(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('google.com') || lower.includes('google.co.');
  }

  resolveUrl(target) {
    if (!target) return null;
    const map = {
      'youtube': 'https://www.youtube.com',
      'google':  'https://www.google.com',
      'gmail':   'https://mail.google.com',
      'github':  'https://github.com'
    };
    const t = target.toLowerCase();
    if (map[t]) return map[t];
    if (!t.startsWith('http')) return `https://${t}`;
    return target;
  }

  // ─── YouTube playback verifier ────────────────────────────────────────────
  async verifyYouTubePlayback(page) {
    try {
      await page.waitForSelector('video', { timeout: 20000 });
      const playbackStatus = await page.evaluate(async () => {
        const rejectBtn = document.querySelector('button[aria-label="Reject all"]');
        if (rejectBtn) rejectBtn.click();
        const agreeBtn = document.querySelector('button[aria-label="Accept all"]');
        if (agreeBtn) agreeBtn.click();
        const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
        if (skipBtn) skipBtn.click();
        const video = document.querySelector('video');
        if (!video) return { success: false, reason: 'NO_VIDEO_ELEMENT' };
        if (video.paused) {
          try {
            const playButton = document.querySelector('.ytp-play-button');
            if (playButton) playButton.click();
            await video.play().catch(() => {});
          } catch (e) {}
        }
        if (video.readyState < 2) {
          await new Promise(r => {
            const fn = () => { video.removeEventListener('canplay', fn); r(); };
            video.addEventListener('canplay', fn);
            setTimeout(r, 8000);
          });
        }
        const t1 = video.currentTime;
        await new Promise(r => setTimeout(r, 2000));
        const t2 = video.currentTime;
        if (video.paused && !video.ended) return { success: false, reason: 'VIDEO_PAUSED_AFTER_PLAY' };
        if (t2 <= t1 && !video.ended)    return { success: false, reason: 'VIDEO_NOT_ADVANCING' };
        return { success: true, currentTime: t2 };
      });
      return playbackStatus;
    } catch (e) {
      return { success: false, reason: `TIMEOUT: ${e.message}` };
    }
  }

  // ─── Main task executor ───────────────────────────────────────────────────
  async executeTask(steps, onProgress = () => {}) {
    const page = await this.getPage();
    const completedSteps = [];
    let contextUrl = page.url();

    if (typeof steps === 'string') {
      try { steps = JSON.parse(steps); } catch (e) {
        throw new Error(`Failed to parse steps JSON: ${e.message}`);
      }
    }
    if (!Array.isArray(steps)) steps = [steps];

    for (let i = 0; i < steps.length; i++) {
      let step = steps[i];
      if (Array.isArray(step)) {
        if (step[0] === 'search') step = { action: step[0], query: step[1] };
        else if (step[0] === 'play') step = { action: step[0], target: step[1], query: step[2] };
        else step = { action: step[0], target: step[1] };
      }

      const result = { action: step.action, success: false, error: null };
      onProgress(`Executing step ${i + 1}/${steps.length}: ${step.action}...`);

      try {
        const searchQuery = step.query || step.text;

        // ── Universal implicit YouTube play ──────────────────────────────────
        if (searchQuery && (step.target === 'youtube' || step.action === 'play' || this.isYouTubePage(contextUrl))) {
          onProgress('Navigating to YouTube...');
          console.log('[BROWSER] Navigating to YouTube URL: https://www.youtube.com');
          await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
          contextUrl = page.url();
          console.log(`[BROWSER] Current URL: ${contextUrl}`);

          if (searchQuery.toLowerCase() !== 'youtube') {
            onProgress(`Searching for: ${searchQuery}...`);
            const sel = 'input#search, input[name="search_query"]';
            await page.waitForSelector(sel, { timeout: 10000 });
            await page.click(sel, { clickCount: 3 });
            await page.type(sel, searchQuery, { delay: 50 });
            await Promise.all([
              page.keyboard.press('Enter'),
              page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
            ]);
            contextUrl = page.url();
            await page.waitForSelector('ytd-video-renderer, ytd-promoted-video-renderer', { timeout: 15000 });
          }

          onProgress('Opening first video result...');
          if (contextUrl.includes('results?search_query')) {
            const videoSel = 'ytd-video-renderer a#thumbnail';
            await page.waitForSelector(videoSel, { timeout: 10000 });
            await Promise.all([
              page.click(videoSel),
              page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
            ]);
            contextUrl = page.url();
          }

          onProgress('Verifying playback...');
          const ps = await this.verifyYouTubePlayback(page);
          if (ps.success) {
            result.success = true;
            result.message = `Playing: ${searchQuery}`;
          } else {
            throw new Error(`Playback verification failed: ${ps.reason}`);
          }
          completedSteps.push(result);
          continue;
        }

        // ── 1. OPEN ──────────────────────────────────────────────────────────
        if (step.action === 'open') {
          onProgress(`Opening ${step.target}...`);
          const url = this.resolveUrl(step.target);
          console.log(`[BROWSER] Navigating to: ${url}`);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          contextUrl = page.url();
          console.log(`[BROWSER] Current URL: ${contextUrl}`);
          result.success = true;
          result.message = `Opened ${url}`;
        }

        // ── 2. SEARCH ────────────────────────────────────────────────────────
        else if (step.action === 'search') {
          onProgress(`Searching for: ${step.query}...`);
          if (step.target) {
            const targetUrl = this.resolveUrl(step.target);
            if (targetUrl && !contextUrl.includes(step.target.toLowerCase())) {
              await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
              contextUrl = page.url();
            }
          }
          if (this.isGooglePage(contextUrl)) {
            await page.waitForSelector('textarea[name="q"], input[name="q"]', { timeout: 10000 });
            await page.click('textarea[name="q"], input[name="q"]', { clickCount: 3 });
            await page.type('textarea[name="q"], input[name="q"]', step.query, { delay: 50 });
            await Promise.all([
              page.keyboard.press('Enter'),
              page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 })
            ]);
            result.success = true;
            result.query = step.query;
          } else if (this.isYouTubePage(contextUrl)) {
            const sel = 'input#search, input[name="search_query"]';
            await page.waitForSelector(sel, { timeout: 10000 });
            await page.click(sel, { clickCount: 3 });
            await page.type(sel, step.query, { delay: 50 });
            await Promise.all([
              page.keyboard.press('Enter'),
              page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
            ]);
            await page.waitForSelector('ytd-video-renderer', { timeout: 15000 });
            result.success = true;
            result.query = step.query;
          } else {
            throw new Error(`Search not implemented for: ${contextUrl}`);
          }
        }

        // ── 3. PLAY ──────────────────────────────────────────────────────────
        else if (step.action === 'play') {
          if (this.isYouTubePage(contextUrl) && contextUrl.includes('results?search_query')) {
            onProgress('Opening first video result...');
            const videoSel = 'ytd-video-renderer a#thumbnail';
            await page.waitForSelector(videoSel, { timeout: 10000 });
            await Promise.all([
              page.click(videoSel),
              page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
            ]);
          }
          onProgress('Verifying playback...');
          const ps = await this.verifyYouTubePlayback(page);
          if (ps.success) {
            result.success = true;
          } else {
            throw new Error(`Playback verification failed: ${ps.reason}`);
          }
        }

        // ── 4. PAUSE ─────────────────────────────────────────────────────────
        else if (step.action === 'pause') {
          const r = await this.pauseVideo();
          result.success = r.success;
        }

        // ── 5. RESUME ────────────────────────────────────────────────────────
        else if (step.action === 'resume') {
          const r = await this.resumeVideo();
          result.success = r.success;
        }

        // ── 6. CLICK ─────────────────────────────────────────────────────────
        else if (step.action === 'click') {
          onProgress('Clicking target...');
          await page.waitForSelector(step.selector || step.target, { timeout: 10000 });
          await page.click(step.selector || step.target);
          result.success = true;
        }

        // ── 7. TYPE ──────────────────────────────────────────────────────────
        else if (step.action === 'type') {
          onProgress('Typing...');
          await page.waitForSelector(step.selector, { timeout: 10000 });
          await page.type(step.selector, step.text, { delay: 50 });
          result.success = true;
        }

        // ── 8. READ RESULTS ──────────────────────────────────────────────────
        else if (step.action === 'read_results') {
          onProgress('Reading page content...');
          const data = await page.evaluate(() => {
            document.querySelectorAll('script, style, noscript, svg').forEach(el => el.remove());
            return document.body.innerText.slice(0, 3000).replace(/\s+/g, ' ').trim();
          });
          result.success = true;
          result.content = data;
        }

        else {
          throw new Error(`Unknown action: ${step.action}`);
        }

        contextUrl = page.url();
      } catch (err) {
        result.success = false;
        result.error = err.message;
        completedSteps.push(result);
        return {
          success: false, failedStep: i + 1,
          action: step.action, reason: err.message,
          currentUrl: contextUrl, completedSteps
        };
      }

      completedSteps.push(result);
    }

    return { success: true, message: 'All steps completed successfully', completedSteps, currentUrl: contextUrl };
  }

  async navigate(url) {
    const page = await this.getPage();
    console.log(`[BROWSER] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`[BROWSER] Current URL: ${page.url()}`);
  }

  async extractContent() {
    const page = await this.getPage();
    return page.evaluate(() => {
      document.querySelectorAll('script, style, noscript, svg').forEach(el => el.remove());
      return document.body.innerText.slice(0, 5000).replace(/\s+/g, ' ').trim();
    });
  }
}

export const puppeteerService = new PuppeteerService();
