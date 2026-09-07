import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.js';
import { speechService } from '../services/speechService.js';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idel Retarget.001");
  const [conversationId, setConversationId] = useState(null);
  const [avatarType, setAvatarType] = useState("boy"); // Default to Boy Avatar!
  const [activeMedia, setActiveMedia] = useState(null); // Embedded YouTube/Media Player state!
  const [subtitle, setSubtitle] = useState("");
  
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

  const resumeListening = () => {
    if (stateRef.current.isSpeaking || stateRef.current.isProcessing) return;
    setTimeout(() => {
      if (!stateRef.current.isSpeaking && !stateRef.current.isProcessing && !stateRef.current.isListening) {
        startListening();
      }
    }, 1000);
  };

  const startSpeaking = useCallback((text, customAnimation = null) => {
    if (!text) {
      stateRef.current.isProcessing = false;
      resumeListening();
      return;
    }
    
    // Play custom animation (e.g. "hello" for wave) or default talking animation
    const anim = customAnimation || "Armature|mixamo.com|Layer0.005 Retarget";
    setCurrentAnimation(anim);
    setIsSpeaking(true);
    stateRef.current.isSpeaking = true;
    setSubtitle(text);
    
    speechService.speak(text, {
      speed: 1.05,
      gender: stateRef.current.avatarType, // 👦 Boy Voice for Boy Avatar, 👧 Girl Voice for Girl Avatar!
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
        setTimeout(() => setSubtitle(""), 4000);
        resumeListening();
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
        setTimeout(() => setSubtitle(""), 4000);
        resumeListening();
      }
    });
  }, []);

  const startListening = useCallback(() => {
    if (stateRef.current.isListening || stateRef.current.isSpeaking || stateRef.current.isProcessing) return;

    setCurrentAnimation('hello.001');

    const success = speechService.startListening({
      onTranscript: async ({ final, text: liveText }) => {
        if (liveText) setSubtitle(`You: "${liveText}"`);
        if (!final || !final.trim()) return;
        
        const text = final.trim();
        console.log("User said:", text);
        
        // Stop listening while AI thinks and speaks
        speechService.stopListening();
        setIsListening(false);
        stateRef.current.isProcessing = true;
        setCurrentAnimation('thinking.001');

        // Check for direct browser actions (YouTube, Google, Navigation)
        const lower = text.toLowerCase();
        let directActionMessage = null;

        if (lower.includes('youtube') || lower.includes('song') || lower.includes('play') || lower.includes('video') || lower.includes('music')) {
          let songQuery = text
            .replace(/open\s+(?:your\s+)?youtube/gi, '')
            .replace(/play\s+(?:on\s+youtube)?/gi, '')
            .replace(/open\s+and\s+play/gi, '')
            .replace(/youtube/gi, '')
            .trim();

          if (!songQuery) songQuery = 'top songs';
          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`;
          const embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(songQuery)}&autoplay=1`;
          
          // Launch embedded media player directly in the app
          setActiveMedia({
            type: 'youtube',
            title: songQuery,
            embedUrl,
            directUrl: ytUrl
          });

          // Also try window.open in case popups are allowed
          try { window.open(ytUrl, '_blank'); } catch (e) {}

          directActionMessage = `Opening YouTube player for "${songQuery}"!`;
        } else if (lower.includes('google') || (lower.includes('search') && !lower.includes('memory'))) {
          let query = text.replace(/open\s+(?:your\s+)?google/gi, '').replace(/search\s+(?:for\s+)?/gi, '').trim();
          if (query) {
            try { window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank'); } catch (e) {}
            directActionMessage = `Searching Google for "${query}".`;
          }
        }
        
        let aiResponse = "";
        try {
          await apiService.streamChat({
            conversationId: stateRef.current.conversationId,
            message: text,
            onEvent: (type, data) => {
              if (type === 'token') {
                aiResponse += data.text || data.token || "";
              } else if (type === 'tool_start' || type === 'tool_end') {
                if (data.toolName === 'youtubeControl' && data.input?.query) {
                  const q = data.input.query;
                  setActiveMedia({
                    type: 'youtube',
                    title: q,
                    embedUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1`,
                    directUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
                  });
                  try { window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank'); } catch (e) {}
                }
              } else if (type === 'end' || type === 'conversation_created') {
                if (data.conversationId) setConversationId(data.conversationId);
              }
            }
          });
        } catch (err) {
          console.warn("Stream chat network note:", err);
          aiResponse = directActionMessage || "I heard your request. Executing command now!";
        }

        if (!aiResponse.trim()) {
          aiResponse = directActionMessage || "I've processed your command.";
        }
        
        startSpeaking(aiResponse);
      },
      onError: (e) => {
        if (e.error !== 'no-speech') {
           console.warn("Speech error:", e.error);
        }
        setIsListening(false);
        setCurrentAnimation('idel Retarget.001');
        resumeListening();
      },
      onEnd: () => {
        setIsListening(false);
        resumeListening();
      }
    });

    if (success) {
      setIsListening(true);
    } else {
      setCurrentAnimation('idel Retarget.001');
    }
  }, [startSpeaking]);

  return (
    <AgentContext.Provider value={{
      isListening, startListening,
      isSpeaking, startSpeaking,
      currentAnimation, setCurrentAnimation,
      avatarType, setAvatarType,
      activeMedia, setActiveMedia,
      subtitle
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
