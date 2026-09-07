import React, { useState, useEffect, useRef } from 'react';
import { YouTubeService } from '../../services/youtubeService.js';

export default function YouTubePlayer({ media, lastAction, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [videoId, setVideoId] = useState(media?.videoId || 'z5y8Clp_TdE');
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Resolve videoId whenever media title changes
  useEffect(() => {
    if (!media) return;
    let isMounted = true;
    if (media.videoId) {
      setVideoId(media.videoId);
    } else {
      YouTubeService.resolveVideoId(media.title).then((id) => {
        if (isMounted && id) setVideoId(id);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [media]);

  const sendCommand = (func, args = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args
          }),
          '*'
        );
      }
    } catch (e) {
      console.warn('YouTube postMessage error:', e);
    }
  };

  // Handle incoming media actions
  useEffect(() => {
    if (!lastAction) return;

    const executeAction = (actionObj) => {
      const act = actionObj.action;
      console.log('[YOUTUBE ACTION]', act, actionObj);

      switch (act) {
        case 'play':
        case 'resume':
          sendCommand('playVideo');
          break;

        case 'pause':
        case 'stop':
          sendCommand('pauseVideo');
          break;

        case 'restart':
          sendCommand('seekTo', [0, true]);
          sendCommand('playVideo');
          break;

        case 'mute':
          sendCommand('mute');
          setIsMuted(true);
          break;

        case 'unmute':
          sendCommand('unMute');
          setIsMuted(false);
          break;

        case 'set_volume':
          if (typeof actionObj.volume === 'number') {
            sendCommand('setVolume', [actionObj.volume]);
            setCurrentVolume(actionObj.volume);
            if (actionObj.volume > 0) {
              sendCommand('unMute');
              setIsMuted(false);
            }
          }
          break;

        case 'volume_up':
          setCurrentVolume((prev) => {
            const next = Math.min(100, prev + (actionObj.step || 15));
            sendCommand('setVolume', [next]);
            sendCommand('unMute');
            setIsMuted(false);
            return next;
          });
          break;

        case 'volume_down':
          setCurrentVolume((prev) => {
            const next = Math.max(0, prev - (actionObj.step || 15));
            sendCommand('setVolume', [next]);
            return next;
          });
          break;

        case 'seek_forward':
          sendCommand('seekTo', [`+${actionObj.seconds || 10}`, true]);
          break;

        case 'seek_backward':
          sendCommand('seekTo', [`-${actionObj.seconds || 10}`, true]);
          break;

        case 'seek_to':
          if (typeof actionObj.seconds === 'number') {
            sendCommand('seekTo', [actionObj.seconds, true]);
          }
          break;

        case 'set_playback_rate':
          if (actionObj.rate) {
            sendCommand('setPlaybackRate', [actionObj.rate]);
          }
          break;

        case 'fullscreen':
          if (containerRef.current && containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
          }
          break;

        case 'exit_fullscreen':
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
          }
          break;

        default:
          break;
      }
    };

    if (lastAction.actions && Array.isArray(lastAction.actions)) {
      lastAction.actions.forEach((a, idx) => {
        setTimeout(() => executeAction(a), idx * 250);
      });
    } else {
      executeAction(lastAction);
    }
  }, [lastAction]);

  if (!media) return null;

  const searchQuery = encodeURIComponent(media.title || 'trending music');
  // Official YouTube Embed with videoId, enablejsapi, autoplay, and playsinline
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1`;

  return (
    <div
      ref={containerRef}
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? 'bottom-20 right-6 w-72'
          : 'top-16 left-6 sm:top-20 sm:left-8 w-[92vw] sm:w-[440px] md:w-[500px]'
      }`}
    >
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-red-500/60 rounded-3xl overflow-hidden shadow-[0_0_45px_rgba(239,68,68,0.4)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-red-950/70 to-slate-900/70 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              ▶
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                YouTube Live Player
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[240px]">
                {media.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`https://www.youtube.com/results?search_query=${searchQuery}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
              title="Open full YouTube website in new tab"
            >
              Full Tab ↗
            </a>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-xs"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '🗖' : '🗕'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition text-sm font-bold"
              title="Close Player"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Frame */}
        {!isMinimized && (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              ref={iframeRef}
              id="youtube-agent-frame"
              src={embedUrl}
              title={`YouTube Player - ${media.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {/* Footer info & interactive controls */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => sendCommand('playVideo')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded font-semibold text-white transition"
            >
              ▶ Play
            </button>
            <button
              onClick={() => sendCommand('pauseVideo')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded font-semibold text-white transition"
            >
              ⏸ Pause
            </button>
            <button
              onClick={() => {
                if (isMuted) {
                  sendCommand('unMute');
                  setIsMuted(false);
                } else {
                  sendCommand('mute');
                  setIsMuted(true);
                }
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded font-semibold text-white transition"
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>

          <span className="text-slate-400 font-mono text-[10px]">
            {isMuted ? 'Muted' : `Vol: ${currentVolume}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
