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
  const [avatarType, setAvatarType] = useState("boy"); // Default to Boy Avatar!
  const [activeMedia, setActiveMedia] = useState(null); // Embedded YouTube/Media Player state
  const [subtitle, setSubtitle] = useState("");
  const [aiText, setAiText] = useState("");
  
  const stateRef = useRef({
    isListening: false,
    isSpeaking: false,
    conversationId: null,
    isProcessing: false,
    avatarType: "boy"
  });

  // Sync refs with state
  useEffect(() => { stateRef.current.isListening = isListening; }, [isListening]);
  useEffect(() => { stateRef.current.isSpeaking = isSpeaking; }, [isSpeaking]);
  useEffect(() => { stateRef.current.conversationId = conversationId; }, [conversationId]);
  useEffect(() => { stateRef.current.avatarType = avatarType; }, [avatarType]);

  const startSpeaking = useCallback((text, customAnimation = null) => {
    if (!text) {
      stateRef.current.isProcessing = false;
      return;
    }
    
    // Play custom animation (e.g. "hello" for wave) or default talking animation
    const anim = customAnimation || "speaking";
    setCurrentAnimation(anim);
    setIsSpeaking(true);
    stateRef.current.isSpeaking = true;
    setAiText(text);
    
    speechService.speak(text, {
      speed: 1.05,
      gender: stateRef.current.avatarType, // 👦 Boy Voice for Boy Avatar, 👧 Girl Voice for Girl Avatar!
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

    // 1. First, process with intelligent Client AI engine
    const localResult = await ClientAI.processQuery(text, stateRef.current.avatarType);

    if (localResult.action === 'youtube') {
      setActiveMedia({
        type: 'youtube',
        title: localResult.title,
        directUrl: localResult.url
      });
      startSpeaking(localResult.response, 'hello');
      return;
    }

    if (localResult.action === 'google') {
      setActiveMedia({
        type: 'google',
        title: localResult.title,
        directUrl: localResult.url
      });
      startSpeaking(localResult.response, 'hello');
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
    } catch (e) {
      // Backend not running / deployed static mode
    }

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
      subtitle, aiText,
      handleQuery
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
