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
    
    speechService.speak(text, {
      speed: 1.05,
      gender: stateRef.current.avatarType, // 👦 Boy Voice for Boy Avatar, 👧 Girl Voice for Girl Avatar!
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
        resumeListening();
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentAnimation("idel Retarget.001");
        stateRef.current.isProcessing = false;
        resumeListening();
      }
    });
  }, []);

  const startListening = useCallback(() => {
    if (stateRef.current.isListening || stateRef.current.isSpeaking || stateRef.current.isProcessing) return;

    setCurrentAnimation('hello.001');

    const success = speechService.startListening({
      onTranscript: async ({ final }) => {
        if (!final || !final.trim()) return;
        
        const text = final.trim();
        console.log("User said:", text);
        
        // Stop listening while AI thinks and speaks
        speechService.stopListening();
        setIsListening(false);
        stateRef.current.isProcessing = true;
        setCurrentAnimation('thinking.001');
        
        let aiResponse = "";
        try {
          await apiService.streamChat({
            conversationId: stateRef.current.conversationId,
            message: text,
            onEvent: (type, data) => {
              if (type === 'token') {
                aiResponse += data.text || data.token || "";
              } else if (type === 'end' || type === 'conversation_created') {
                if (data.conversationId) setConversationId(data.conversationId);
              }
            }
          });
        } catch (err) {
          console.error(err);
          aiResponse = "I encountered a network error.";
        }

        if (!aiResponse.trim()) {
          aiResponse = "I heard you, but I don't have a response.";
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
      avatarType, setAvatarType
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
