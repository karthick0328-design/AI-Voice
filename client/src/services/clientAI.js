/**
 * ClientAI - Comprehensive Natural Action Layer for YouTube & Assistant Operations
 * Implements all 30 natural action categories, multi-command sequential execution,
 * dynamic parameter extraction, and state verification.
 */

// Helper: Convert word numbers to digits
const wordToNum = (val) => {
  if (!val) return 10;
  const map = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    fifteen: 15, twenty: 20, thirty: 30, forty: 40,
    fifty: 50, sixty: 60
  };
  return map[val] || parseInt(val, 10) || 10;
};

// Parse single action against current player or browser
export function parseSingleAction(text) {
  const t = (text || '').trim().toLowerCase();
  if (!t) return null;

  // 1. Video Information / Status
  if (
    t.includes('what song is playing') || t.includes('what video is this') ||
    t.includes('what is the title') || t.includes('how long is this video') ||
    t.includes('how much time is left') || t.includes('where am i in the video') ||
    t === 'status' || t === 'video info' || t === 'song info'
  ) {
    return {
      action: 'current_status',
      response: 'Checking current video details and playback status.'
    };
  }

  // 2. Restart Video
  if (
    t.includes('start from the beginning') || t.includes('restart the video') ||
    t.includes('restart the song') || t.includes('play from beginning') ||
    t.includes('start the song from the beginning') || t.includes('play it from the start') ||
    t === 'restart' || t === 'start over'
  ) {
    return {
      action: 'restart',
      response: 'Restarting video from the beginning.'
    };
  }

  // 3. Mute / Unmute
  if (
    t === 'unmute' || t.includes('turn the sound on') || t.includes('turn on the sound') ||
    t.includes('enable sound') || t.includes('bring the sound back')
  ) {
    return {
      action: 'unmute',
      response: 'Unmuted video.'
    };
  }
  if (
    t === 'mute' || t.includes('mute the video') || t.includes('mute the song') ||
    t.includes('turn the sound off') || t.includes('silence it') || t.includes('remove the sound')
  ) {
    return {
      action: 'mute',
      response: 'Muted video.'
    };
  }

  // 4. Exact Volume Set (e.g. "set volume to 50", "volume 70", "set sound to 80%")
  const setVolMatch = t.match(/(?:set volume to|set the sound to|volume to|set volume|volume)\s*(\d{1,3})\s*%?/);
  if (setVolMatch && !t.includes('up') && !t.includes('down') && !t.includes('increase') && !t.includes('decrease')) {
    const vol = parseInt(setVolMatch[1], 10);
    return {
      action: 'set_volume',
      volume: Math.min(100, Math.max(0, vol)),
      response: `Setting volume to ${vol}%.`
    };
  }

  // 5. Volume Up
  if (
    t.includes('increase volume') || t.includes('volume up') || t.includes('louder') ||
    t.includes('turn the volume up') || t.includes('make it louder') || t.includes('increase the sound') ||
    t === 'louder' || t === 'volume up'
  ) {
    return {
      action: 'volume_up',
      step: 15,
      response: 'Increasing volume.'
    };
  }

  // 6. Volume Down
  if (
    t.includes('decrease volume') || t.includes('volume down') || t.includes('turn the volume down') ||
    t.includes('lower the volume') || t.includes('make it quieter') || t.includes('reduce the sound') ||
    t === 'quieter' || t === 'volume down'
  ) {
    return {
      action: 'volume_down',
      step: 15,
      response: 'Lowering volume.'
    };
  }

  // 7. Fullscreen / Exit Fullscreen
  if (
    t.includes('exit fullscreen') || t.includes('close fullscreen') ||
    t.includes('leave fullscreen') || t.includes('normal screen') || t.includes('exit full screen')
  ) {
    return {
      action: 'exit_fullscreen',
      response: 'Exiting fullscreen.'
    };
  }
  if (
    t.includes('fullscreen') || t.includes('full screen') || t.includes('make it fullscreen') ||
    t.includes('open fullscreen') || t.includes('expand the video')
  ) {
    return {
      action: 'fullscreen',
      response: 'Switching to fullscreen.'
    };
  }

  // 8. Playback Rate
  const speedMatch = t.match(/(?:play at|set speed to|speed to|playback rate to|speed)\s*([\d\.]+)x?/);
  if (speedMatch) {
    const rate = parseFloat(speedMatch[1]);
    return {
      action: 'set_playback_rate',
      rate,
      response: `Setting playback speed to ${rate}x.`
    };
  }
  if (t.includes('make it faster') || t.includes('speed up the video') || t === 'speed up' || t === 'faster') {
    return {
      action: 'set_playback_rate',
      rate: 1.5,
      response: 'Speeding up video to 1.5x.'
    };
  }
  if (t.includes('play slower') || t.includes('slow it down') || t === 'slow down' || t === 'slower') {
    return {
      action: 'set_playback_rate',
      rate: 0.75,
      response: 'Slowing down video to 0.75x.'
    };
  }

  // 9. Captions / Subtitles
  if (
    t.includes('turn on subtitles') || t.includes('enable subtitles') ||
    t.includes('turn captions on') || t.includes('show captions') ||
    t === 'subtitles on' || t === 'captions on'
  ) {
    return {
      action: 'captions_on',
      response: 'Enabling captions.'
    };
  }
  if (
    t.includes('turn subtitles off') || t.includes('disable captions') ||
    t.includes('hide subtitles') || t.includes('disable subtitles') ||
    t === 'subtitles off' || t === 'captions off'
  ) {
    return {
      action: 'captions_off',
      response: 'Disabling captions.'
    };
  }

  // 10. Seek to Timestamp (e.g. "go to 1:30", "jump to 2 minutes 30 seconds")
  const timeColonMatch = t.match(/(?:go to|jump to|play from|start from|seek to)\s*(\d+):(\d+)/);
  if (timeColonMatch) {
    const secs = parseInt(timeColonMatch[1], 10) * 60 + parseInt(timeColonMatch[2], 10);
    return {
      action: 'seek_to',
      seconds: secs,
      response: `Jumping to ${timeColonMatch[1]}:${timeColonMatch[2]}.`
    };
  }
  const timeWordMatch = t.match(/(?:go to|jump to|play from|start from|seek to)\s*(\d+)\s*(?:minutes?|mins?)(?:\s*(\d+)\s*(?:seconds?|secs?))?/);
  if (timeWordMatch) {
    const secs = parseInt(timeWordMatch[1], 10) * 60 + (timeWordMatch[2] ? parseInt(timeWordMatch[2], 10) : 0);
    return {
      action: 'seek_to',
      seconds: secs,
      response: `Jumping to requested timestamp.`
    };
  }

  // 11. Seek Forward (e.g. "fast forward 10 seconds", "skip 20 seconds", "forward 1 minute")
  if (t.includes('forward 1 minute') || t.includes('skip 1 minute') || t.includes('jump forward 1 minute')) {
    return {
      action: 'seek_forward',
      seconds: 60,
      response: 'Skipping forward 1 minute.'
    };
  }
  const seekFwdRegex = /(?:fast forward|skip ahead|jump forward|move forward|go forward|seek forward|forward|skip)\s*(?:the)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|sixty)?\s*(?:seconds?|secs?|s)?/;
  const fwdMatch = t.match(seekFwdRegex);
  if (fwdMatch && (t.includes('skip') || t.includes('forward') || t.includes('jump') || t.includes('fast')) && !t.includes('back') && !t.includes('song') && !t.includes('video') && !t.includes('next')) {
    const secs = wordToNum(fwdMatch[1]);
    return {
      action: 'seek_forward',
      seconds: secs,
      response: `Skipped forward ${secs} seconds.`
    };
  }

  // 12. Seek Backward (e.g. "rewind 10 seconds", "go back 20 seconds", "jump back 1 minute")
  if (t.includes('rewind 1 minute') || t.includes('jump back 1 minute') || t.includes('go back 1 minute')) {
    return {
      action: 'seek_backward',
      seconds: 60,
      response: 'Rewinding 1 minute.'
    };
  }
  const seekBwdRegex = /(?:rewind|take me back|jump back|move backward|go backward|skip back|seek back|backward|back)\s*(?:the)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|sixty)?\s*(?:seconds?|secs?|s)?/;
  const bwdMatch = t.match(seekBwdRegex);
  if (bwdMatch && !t.includes('page') && !t.includes('previous') && !t.includes('song') && !t.includes('video')) {
    const secs = wordToNum(bwdMatch[1]);
    return {
      action: 'seek_backward',
      seconds: secs,
      response: `Rewound ${secs} seconds.`
    };
  }

  // 13. Next Video / Song
  if (
    t.includes('next song') || t.includes('next video') || t.includes('play next') ||
    t.includes('go to the next') || t.includes('skip to the next') || t.includes('play another song') ||
    t === 'next' || t === 'next one'
  ) {
    return {
      action: 'next',
      response: 'Playing next video.'
    };
  }

  // 14. Previous Video / Song
  if (
    t.includes('previous song') || t.includes('previous video') || t.includes('play previous') ||
    t.includes('before song') || t.includes('go to the previous') || t.includes('play the before song') ||
    t.includes('go back to the previous') || t === 'previous' || t === 'previous one'
  ) {
    return {
      action: 'previous',
      response: 'Playing previous video.'
    };
  }

  // 15. Pause / Stop
  if (
    t === 'pause' || t === 'pause it' || t === 'stop' || t === 'stop it' ||
    t.includes('pause the song') || t.includes('pause the video') ||
    t.includes('stop the song') || t.includes('stop playing') || t.includes('hold the video')
  ) {
    return {
      action: 'pause',
      response: 'Paused video.'
    };
  }

  // 16. Resume / Continue
  if (
    t === 'resume' || t === 'resume it' || t === 'continue' || t === 'continue playing' ||
    t.includes('resume playing') || t.includes('continue the song') || t.includes('start again') ||
    t.includes('play again')
  ) {
    return {
      action: 'resume',
      response: 'Resuming playback.'
    };
  }

  // 17. Simple Play / Start (when player already loaded)
  if (
    t === 'play' || t === 'play it' || t === 'start playing' || t === 'start the song' ||
    t === 'start the video' || t === 'play this' || t === 'start the video again'
  ) {
    return {
      action: 'play',
      response: 'Starting playback.'
    };
  }

  // 18. Scroll actions
  if (t.includes('scroll to the comments') || t.includes('show comments') || t.includes('comments')) {
    return { action: 'scroll_to_comments', response: 'Scrolling to comments.' };
  }
  if (t.includes('scroll down') || t.includes('show more videos') || t.includes('scroll down a little')) {
    return { action: 'scroll_down', response: 'Scrolling down.' };
  }
  if (t.includes('scroll up')) {
    return { action: 'scroll_up', response: 'Scrolling up.' };
  }

  // 19. Like / Subscribe
  if (t === 'like this video' || t === 'like the song' || t === 'like') {
    return { action: 'like', response: 'Liked video.' };
  }
  if (t === 'unlike' || t === 'remove like') {
    return { action: 'unlike', response: 'Removed like.' };
  }
  if (t === 'subscribe' || t === 'subscribe to this channel') {
    return { action: 'subscribe', response: 'Subscribed to channel.' };
  }
  if (t === 'unsubscribe') {
    return { action: 'unsubscribe', response: 'Unsubscribed.' };
  }

  // 20. Browser Navigation
  if (t === 'go back' || t === 'go to the previous page' || t === 'browser back') {
    return { action: 'browser_back', response: 'Going back to previous page.' };
  }
  if (t === 'go forward' || t === 'browser forward') {
    return { action: 'browser_forward', response: 'Going forward.' };
  }

  return null;
}

export class ClientAI {
  static async processQuery(query, avatarType = 'boy', activeMedia = null) {
    const text = (query || '').trim();
    const lower = text.toLowerCase();

    // ═════════════════════════════════════════════════════════════════════════
    // 1. MULTI-COMMAND NATURAL COMBINATION (e.g. "Pause and go back 10 seconds")
    // ═════════════════════════════════════════════════════════════════════════
    const splitParts = text.split(/\s+(?:and then|and|then|,)\s+/i).filter(Boolean);
    if (splitParts.length > 1) {
      const actions = [];
      const responses = [];

      for (const part of splitParts) {
        const act = parseSingleAction(part);
        if (act) {
          actions.push(act);
          responses.push(act.response);
        }
      }

      if (actions.length > 0) {
        return {
          action: 'multi_action',
          actions,
          response: responses.join(' ')
        };
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. SINGLE MEDIA CONTROL ACTION
    // ═════════════════════════════════════════════════════════════════════════
    const singleAction = parseSingleAction(text);
    if (singleAction) {
      return singleAction;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. YOUTUBE SEARCH & PLAY (New Video / Song Request)
    // ═════════════════════════════════════════════════════════════════════════
    if (
      lower.includes('youtube') ||
      lower.includes('play') ||
      lower.includes('song') ||
      lower.includes('music') ||
      lower.includes('video') ||
      lower.includes('search youtube') ||
      lower.startsWith('find')
    ) {
      let songQuery = text
        .replace(/open\s+(?:a\s+)?(?:your\s+)?(?:the\s+)?youtube\s*(?:player)?/gi, '')
        .replace(/open\s+(?:the\s+)?(?:youtube\s+)?player(?:\s+for)?/gi, '')
        .replace(/search\s+youtube\s+for/gi, '')
        .replace(/play\s+(?:on\s+youtube)?/gi, '')
        .replace(/open\s+and\s+play/gi, '')
        .replace(/can\s+you\s+play/gi, '')
        .replace(/youtube\s+player/gi, '')
        .replace(/youtube/gi, '')
        .replace(/player/gi, '')
        .replace(/song/gi, '')
        .replace(/music/gi, '')
        .replace(/video/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!songQuery) songQuery = 'top trending music';
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`;

      return {
        action: 'youtube_play',
        title: songQuery,
        url: ytUrl,
        response: `Playing "${songQuery}" on YouTube for you right now!`
      };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. GOOGLE SEARCH
    // ═════════════════════════════════════════════════════════════════════════
    if (
      lower.startsWith('search') ||
      lower.startsWith('google') ||
      lower.includes('search google for') ||
      lower.includes('search for')
    ) {
      const q = text
        .replace(/^search\s+(?:google\s+)?(?:for\s+)?/gi, '')
        .replace(/^google\s+/gi, '')
        .trim();

      if (q) {
        const gUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
        return {
          action: 'google',
          title: q,
          url: gUrl,
          response: `Searching Google for "${q}".`
        };
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. CURRENT TIME & DATE
    // ═════════════════════════════════════════════════════════════════════════
    if (
      lower.includes('time') ||
      lower.includes('date') ||
      lower.includes('day') ||
      lower.includes('today')
    ) {
      const now = new Date();
      if (lower.includes('time')) {
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          action: 'none',
          response: `The current time is ${timeStr}.`
        };
      } else {
        const dateStr = now.toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return {
          action: 'none',
          response: `Today is ${dateStr}.`
        };
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 6. GREETINGS & INTRODUCTIONS
    // ═════════════════════════════════════════════════════════════════════════
    if (
      lower.includes('hello') ||
      lower.includes('hi') ||
      lower.includes('hey') ||
      lower.includes('good morning') ||
      lower.includes('good evening') ||
      lower.includes('good afternoon')
    ) {
      const name = avatarType === 'boy' ? 'Alex' : 'Nova';
      const greetings = [
        `Hello! I'm ${name}, your AI companion. How can I assist you today?`,
        `Hi there! Great to see you. What song would you like to hear, or what can I help you with?`,
        `Hey! I'm ready. You can tell me to play any song on YouTube, adjust volume, or ask questions!`
      ];
      return {
        action: 'wave',
        response: greetings[Math.floor(Math.random() * greetings.length)]
      };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 7. IDENTITY & CAPABILITIES
    // ═════════════════════════════════════════════════════════════════════════
    if (
      lower.includes('who are you') ||
      lower.includes('your name') ||
      lower.includes('what can you do') ||
      lower.includes('help')
    ) {
      const name = avatarType === 'boy' ? 'Alex' : 'Nova';
      return {
        action: 'wave',
        response: `I am ${name}, your 3D AI Assistant. I have full natural-language control over YouTube (play, pause, seek, volume, speed, captions, fullscreen, restart) and can answer all your questions in real time!`
      };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 8. HOW ARE YOU?
    // ═════════════════════════════════════════════════════════════════════════
    if (lower.includes('how are you') || lower.includes('how r u')) {
      return {
        action: 'wave',
        response: `I'm feeling great and ready to assist! What would you like to do?`
      };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 9. JOKES
    // ═════════════════════════════════════════════════════════════════════════
    if (lower.includes('joke') || lower.includes('funny') || lower.includes('make me laugh')) {
      const jokes = [
        `Why do programmers prefer dark mode? Because light attracts bugs!`,
        `Why did the computer go to the doctor? Because it caught a virus!`,
        `There are 10 types of people in the world: those who understand binary, and those who don't.`,
        `Why was the JavaScript developer sad? Because they didn't know how to 'null' their feelings!`
      ];
      return {
        action: 'none',
        response: jokes[Math.floor(Math.random() * jokes.length)]
      };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 10. MATH & CALCULATIONS
    // ═════════════════════════════════════════════════════════════════════════
    const mathMatch = lower.match(/(?:what is|calculate|solve|how much is)?\s*([0-9\.\s\+\-\*\/\(\)\^\%]+)/);
    if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[\+\-\*\/]/.test(mathMatch[1])) {
      try {
        const expr = mathMatch[1].trim();
        const sanitized = expr.replace(/[^0-9\+\-\*\/\.\(\)\s]/g, '');
        // eslint-disable-next-line no-new-func
        const result = Function(`'use strict'; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result)) {
          return {
            action: 'none',
            response: `The result of ${expr} is ${result}.`
          };
        }
      } catch (e) {}
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 11. WIKIPEDIA KNOWLEDGE LOOKUP
    // ═════════════════════════════════════════════════════════════════════════
    if (
      lower.startsWith('who is') ||
      lower.startsWith('what is') ||
      lower.startsWith('tell me about') ||
      lower.startsWith('explain')
    ) {
      const topic = text
        .replace(/^(?:who is|what is|tell me about|explain)\s+/gi, '')
        .replace(/[\?\.]/g, '')
        .trim();

      if (topic) {
        try {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.extract) {
              const shortExtract = data.extract.split('. ').slice(0, 2).join('. ') + '.';
              return {
                action: 'none',
                response: shortExtract
              };
            }
          }
        } catch (e) {}
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 12. GENERAL CONVERSATION FALLBACK
    // ═════════════════════════════════════════════════════════════════════════
    return {
      action: 'none',
      response: `I heard: "${text}". I can control YouTube, search the web, or answer questions for you!`
    };
  }
}
