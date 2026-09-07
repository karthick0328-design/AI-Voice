import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.js';
import { speechService } from '../services/speechService.js';
import { ClientAI } from '../services/clientAI.js';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idel Retarget.001");
  const [conversationId, setConversationId] = useState(null);
  const [avatarType, setAvatarType] = useState("boy");
  const [activeMedia, setActiveMedia] = useState(null); // Embedded YouTube state
  const [lastAction, setLastAction] = useState(null); // Last YouTube action object
  const [subtitle, setSubtitle] = useState("");
  const [aiText, setAiText] = useState("");
  
  const stateRef = useRef({
    isListening: false,
    isSpeaking: false,
    conversationId: null,
    isProcessing: false,
    avatarType: "boy",
    activeMedia: null
  });

  useEffect(() => { stateRef.current.isListening = isListening; }, [isListening]);
  useEffect(() => { stateRef.current.isSpeaking = isSpeaking; }, [isSpeaking]);
  useEffect(() => { stateRef.current.conversationId = conversationId; }, [conversationId]);
  useEffect(() => { stateRef.current.avatarType = avatarType; }, [avatarType]);
  useEffect(() => { stateRef.current.activeMedia = activeMedia; }, [activeMedia]);

  const startSpeaking = useCallback((text, customAnimation = null) => {
    if (!text) {
      stateRef.current.isProcessing = false;
      return;
    }
    
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
      },
      onError: () => {
        setIsSpeaking(false);
        stateRef.current.isSpeaking = false;
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
      }
    });
  }, []);

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
      setActiveMedia({
        type: 'youtube',
        title: localResult.title,
        directUrl: localResult.url
      });
      setLastAction(localResult);
      startSpeaking(localResult.response, 'hello');
      return;
    }

    // If Google search requested
    if (localResult.action === 'google') {
      setActiveMedia({
        type: 'google',
        title: localResult.title,
        directUrl: localResult.url
      });
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
      handleQuery
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
