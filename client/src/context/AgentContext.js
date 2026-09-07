import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.js';
import { speechService } from '../services/speechService.js';
import { ClientAI } from '../services/clientAI.js';
import { YouTubeService } from '../services/youtubeService.js';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idel Retarget.001");
  const [conversationId, setConversationId] = useState(null);
  const [avatarType, setAvatarType] = useState("boy");
  const [activeMedia, setActiveMedia] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [subtitle, setSubtitle] = useState("");
  const [aiText, setAiText] = useState("");
  const [isContinuousVoice, setIsContinuousVoice] = useState(true);
  
  const stateRef = useRef({
    isListening: false,
    isSpeaking: false,
    conversationId: null,
    isProcessing: false,
    avatarType: "boy",
    activeMedia: null,
    isContinuousVoice: true
  });

  useEffect(() => { stateRef.current.isListening = isListening; }, [isListening]);
  useEffect(() => { stateRef.current.isSpeaking = isSpeaking; }, [isSpeaking]);
  useEffect(() => { stateRef.current.conversationId = conversationId; }, [conversationId]);
  useEffect(() => { stateRef.current.avatarType = avatarType; }, [avatarType]);
  useEffect(() => { stateRef.current.activeMedia = activeMedia; }, [activeMedia]);
  useEffect(() => { stateRef.current.isContinuousVoice = isContinuousVoice; }, [isContinuousVoice]);

  const openTab = (url) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {}
    try {
      const win = window.open(url, '_blank');
      if (win) win.focus();
    } catch (e) {}
  };

  const resumeListening = useCallback(() => {
    if (!stateRef.current.isContinuousVoice) return;
    setTimeout(() => {
      if (!stateRef.current.isSpeaking && !stateRef.current.isProcessing && !stateRef.current.isListening) {
        startListening();
      }
    }, 600);
  }, []);

  const startSpeaking = useCallback((text, customAnimation = null) => {
    if (!text) {
      stateRef.current.isProcessing = false;
      resumeListening();
      return;
    }
    
    // Stop microphone during TTS to avoid picking up assistant's own voice
    speechService.stopListening();
    setIsListening(false);
    
    const anim = customAnimation || "speaking";
    setCurrentAnimation(anim);
    setIsSpeaking(true);
    stateRef.current.isSpeaking = true;
    setAiText(text);
    
    speechService.speak(text, {
      speed: 1.05,
      gender: stateRef.current.avatarType,
      onEnd: () => {
        setIsSpeaking(false);
        stateRef.current.isSpeaking = false;
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
        resumeListening();
      },
      onError: () => {
        setIsSpeaking(false);
        stateRef.current.isSpeaking = false;
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
        resumeListening();
      }
    });
  }, [resumeListening]);

  const handleQuery = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const text = queryText.trim();
    setSubtitle(`You: "${text}"`);
    stateRef.current.isProcessing = true;
    setCurrentAnimation('thinking.001');

    // 1. Process with ClientAI Natural Action Layer
    const localResult = await ClientAI.processQuery(text, stateRef.current.avatarType, stateRef.current.activeMedia);

    // If new YouTube playback requested
    if (localResult.action === 'youtube_play') {
      const videoId = await YouTubeService.resolveVideoId(localResult.title);
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
      
      openTab(watchUrl);

      setActiveMedia({
        type: 'youtube',
        title: localResult.title,
        videoId,
        directUrl: watchUrl
      });
      setLastAction({ ...localResult, videoId });
      startSpeaking(localResult.response, 'hello');
      return;
    }

    // If Google browser automation requested (Open Google or Search)
    if (
      localResult.action === 'google_search' ||
      localResult.action === 'google_open' ||
      localResult.action === 'google'
    ) {
      // 1. Open authentic real Google URL in browser
      const targetUrl = localResult.url || 'https://www.google.com/';
      openTab(targetUrl);

      // 2. Trigger backend Puppeteer browser automation
      try {
        if (localResult.action === 'google_open') {
          fetch('/api/google/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }).catch(() => {});
        } else {
          fetch('/api/google/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: localResult.query || localResult.title || '' })
          }).catch(() => {});
        }
      } catch (e) {}

      // Set activeMedia so authentic Google Search UI displays on screen
      setActiveMedia({
        type: 'google',
        action: localResult.action,
        query: localResult.query || localResult.title || text,
        title: localResult.title || localResult.query || text,
        directUrl: targetUrl
      });
      setLastAction(localResult);
      startSpeaking(localResult.response, 'hello');
      return;
    }

    // If YouTube action (pause, resume, seek, volume, speed, captions, restart, etc.)
    if (
      localResult.action &&
      localResult.action !== 'none' &&
      localResult.action !== 'wave'
    ) {
      setLastAction({ ...localResult, timestamp: Date.now() });

      // Notify backend if running
      try {
        fetch('/api/youtube/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localResult)
        }).catch(() => {});
      } catch (e) {}

      startSpeaking(localResult.response, 'speaking');
      return;
    }

    // 2. Try streaming with server API if connected
    let serverResponse = "";
    try {
      await apiService.streamChat({
        conversationId: stateRef.current.conversationId,
        message: text,
        onEvent: (type, data) => {
          if (type === 'token') {
            serverResponse += data.text || data.token || "";
          } else if (type === 'end' || type === 'conversation_created') {
            if (data.conversationId) setConversationId(data.conversationId);
          }
        }
      });
    } catch (e) {}

    const finalAnswer = serverResponse.trim() || localResult.response;
    const animToPlay = localResult.action === 'wave' ? 'hello' : 'speaking';
    startSpeaking(finalAnswer, animToPlay);
  }, [startSpeaking]);

  const startListening = useCallback(() => {
    if (stateRef.current.isListening || stateRef.current.isSpeaking || stateRef.current.isProcessing) return;

    speechService.unlock();
    setCurrentAnimation('hello.001');

    const success = speechService.startListening({
      onTranscript: async ({ final, text: liveText }) => {
        if (liveText) setSubtitle(`Listening: "${liveText}"`);
        if (!final || !final.trim()) return;
        
        speechService.stopListening();
        setIsListening(false);
        handleQuery(final);
      },
      onError: (e) => {
        setIsListening(false);
        setCurrentAnimation('idel Retarget.001');
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (success) {
      setIsListening(true);
    } else {
      setCurrentAnimation('idel Retarget.001');
    }
  }, [handleQuery]);

  return (
    <AgentContext.Provider value={{
      isListening, startListening,
      isSpeaking, startSpeaking,
      currentAnimation, setCurrentAnimation,
      avatarType, setAvatarType,
      activeMedia, setActiveMedia,
      lastAction, setLastAction,
      subtitle, aiText,
      isContinuousVoice, setIsContinuousVoice,
      handleQuery
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
