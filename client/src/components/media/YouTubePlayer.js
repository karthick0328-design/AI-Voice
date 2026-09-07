import React, { useState, useEffect, useRef } from 'react';
import { YouTubeService } from '../../services/youtubeService.js';

export default function YouTubePlayer({ media, lastAction, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [videoId, setVideoId] = useState(media?.videoId || 'z5y8Clp_TdE');
  const [isReady, setIsReady] = useState(false);
  
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const playerDivId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);

  // 1. Resolve videoId when media changes
  useEffect(() => {
    if (!media) return;
    let isMounted = true;
    if (media.videoId) {
      setVideoId(media.videoId);
    } else {
      YouTubeService.resolveVideoId(media.title).then((id) => {
        if (isMounted && id) {
          setVideoId(id);
          if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
            playerRef.current.loadVideoById(id);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [media]);

  // 2. Initialize official YouTube IFrame Player
  useEffect(() => {
    let checkInterval = null;

    const initPlayer = () => {
      if (window.YT && window.YT.Player && document.getElementById(playerDivId.current)) {
        try {
          playerRef.current = new window.YT.Player(playerDivId.current, {
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              enablejsapi: 1,
              playsinline: 1,
              rel: 0
            },
            events: {
              onReady: (event) => {
                setIsReady(true);
                try {
                  event.target.playVideo();
                } catch (e) {}
              },
              onError: (e) => {
                console.warn('[YT Player Error]:', e.data);
              }
            }
          });
          return true;
        } catch (err) {
          console.warn('[YT Player init error]:', err);
        }
      }
      return false;
    };

    if (!initPlayer()) {
      checkInterval = setInterval(() => {
        if (initPlayer()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId]);

  // 3. Direct execution of all voice commands against player instance
  useEffect(() => {
    if (!lastAction || !playerRef.current) return;

    const executeAction = (actionObj) => {
      const p = playerRef.current;
      const act = actionObj.action;
      console.log('[EXECUTING YOUTUBE VOICE ACTION]:', act, actionObj);

      try {
        switch (act) {
          case 'pause':
          case 'stop':
            if (typeof p.pauseVideo === 'function') p.pauseVideo();
            break;

          case 'play':
          case 'resume':
            if (typeof p.playVideo === 'function') p.playVideo();
            break;

          case 'restart':
            if (typeof p.seekTo === 'function') p.seekTo(0, true);
            if (typeof p.playVideo === 'function') p.playVideo();
            break;

          case 'mute':
            if (typeof p.mute === 'function') p.mute();
            setIsMuted(true);
            break;

          case 'unmute':
            if (typeof p.unMute === 'function') p.unMute();
            setIsMuted(false);
            break;

          case 'set_volume':
            if (typeof actionObj.volume === 'number' && typeof p.setVolume === 'function') {
              p.setVolume(actionObj.volume);
              setCurrentVolume(actionObj.volume);
              if (actionObj.volume > 0 && typeof p.unMute === 'function') {
                p.unMute();
                setIsMuted(false);
              }
            }
            break;

          case 'volume_up':
            if (typeof p.getVolume === 'function' && typeof p.setVolume === 'function') {
              const current = p.getVolume();
              const next = Math.min(100, current + (actionObj.step || 15));
              p.setVolume(next);
              if (typeof p.unMute === 'function') p.unMute();
              setIsMuted(false);
              setCurrentVolume(next);
            }
            break;

          case 'volume_down':
            if (typeof p.getVolume === 'function' && typeof p.setVolume === 'function') {
              const current = p.getVolume();
              const next = Math.max(0, current - (actionObj.step || 15));
              p.setVolume(next);
              setCurrentVolume(next);
            }
            break;

          case 'seek_forward':
            if (typeof p.getCurrentTime === 'function' && typeof p.seekTo === 'function') {
              const cur = p.getCurrentTime();
              p.seekTo(cur + (actionObj.seconds || 10), true);
            }
            break;

          case 'seek_backward':
            if (typeof p.getCurrentTime === 'function' && typeof p.seekTo === 'function') {
              const cur = p.getCurrentTime();
              p.seekTo(Math.max(0, cur - (actionObj.seconds || 10)), true);
            }
            break;

          case 'seek_to':
            if (typeof actionObj.seconds === 'number' && typeof p.seekTo === 'function') {
              p.seekTo(actionObj.seconds, true);
            }
            break;

          case 'set_playback_rate':
            if (actionObj.rate && typeof p.setPlaybackRate === 'function') {
              p.setPlaybackRate(actionObj.rate);
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
      } catch (err) {
        console.warn('[YT Action Execution Exception]:', err);
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
              href={`https://www.youtube.com/watch?v=${videoId}`}
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
        <div className={`relative aspect-video w-full bg-black ${isMinimized ? 'hidden' : 'block'}`}>
          <div id={playerDivId.current} className="w-full h-full" />
        </div>

        {/* Footer controls */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                  playerRef.current.playVideo();
                }
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded font-semibold text-white transition"
            >
              ▶ Play
            </button>
            <button
              onClick={() => {
                if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
                  playerRef.current.pauseVideo();
                }
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded font-semibold text-white transition"
            >
              ⏸ Pause
            </button>
            <button
              onClick={() => {
                if (!playerRef.current) return;
                if (isMuted) {
                  if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
                  setIsMuted(false);
                } else {
                  if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
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
