import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles } from 'lucide-react';
import { AvatarCanvas } from '../avatar/AvatarCanvas.js';
import { useAgent } from '../../context/AgentContext.js';
import { speechService } from '../../services/speechService.js';
import { apiService } from '../../services/api.js';

export function VoiceModeModal({ isOpen, onClose }) {
  const { aiState, setAiState, statusText, setStatusText, speakMessage, stopSpeaking, currentConversationId } = useAgent();
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      stopVoiceSession();
    }
  }, [isOpen]);

  const startVoiceSession = () => {
    setIsListening(true);
    setAiState('LISTENING');
    setStatusText('Listening... Say your prompt aloud');
    
    // Unlock speech synthesis on user interaction
    speechService.unlock();

    speechService.startListening({
      onTranscript: ({ text, final }) => {
        setTranscript(text);
        
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (final && text.trim().length > 2) {
          silenceTimerRef.current = setTimeout(() => {
            handleVoiceSubmit(text.trim());
          }, 2000); // Wait 2 seconds for more speech before submitting
        }
      },
      onError: (err) => {
        console.warn('Voice error:', err);
      }
    });
  };

  const stopVoiceSession = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    speechService.stopListening();
    setIsListening(false);
    setAiState('IDLE');
    setStatusText('Agent Online & Ready');
  };

  const handleVoiceSubmit = async (userPrompt) => {
    stopVoiceSession();
    setAiState('THINKING');
    setStatusText(`Reasoning: "${userPrompt}"`);
    setAiResponse(''); // Clear previous response

    try {
      let fullResponse = '';
      await apiService.streamChat({
        conversationId: currentConversationId || 'voice-mode',
        message: userPrompt,
        onEvent: (event, data) => {
          if (event === 'state_change') {
            setAiState(data.state);
            setStatusText(data.statusText);
          } else if (event === 'token') {
            fullResponse += data.token;
            setAiResponse(fullResponse);
          } else if (event === 'complete') {
            fullResponse = data.content;
            setAiResponse(fullResponse);
            speakMessage(fullResponse);
          } else if (event === 'error') {
            throw new Error(data.message || data.error || 'Server error occurred');
          }
        }
      });
    } catch (err) {
      console.error('Voice chat error:', err);
      setAiState('ERROR');
      setStatusText(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-dark-950/95 backdrop-blur-xl p-6 md:p-12 animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span>IMMERSIVE AI VOICE MODE</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Central 3D Avatar */}
      <div className="w-full max-w-lg h-96 my-auto flex items-center justify-center">
        <AvatarCanvas className="w-full h-full bg-transparent border-none shadow-none" />
      </div>

      {/* Live Transcription & Status Display */}
      <div className="w-full max-w-2xl text-center space-y-4">
        <div className="min-h-[100px] flex flex-col items-center justify-center space-y-3">
          {/* User's spoken prompt */}
          {transcript && (
            <p className="text-lg md:text-xl font-medium text-slate-300 max-w-xl italic">
              "{transcript}"
            </p>
          )}
          
          {/* AI's generated response */}
          {!isListening && aiResponse && (
            <p className="text-xl md:text-2xl font-semibold text-emerald-400 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-2">
              {aiResponse}
            </p>
          )}

          {/* Status text fallback */}
          {!transcript && !aiResponse && (
            <p className="text-slate-500 italic text-base">
              {isListening ? 'Speak now... Your agent is listening' : statusText}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => {
              if (isListening) stopVoiceSession();
              else startVoiceSession();
            }}
            className={`p-5 rounded-full transition-all shadow-2xl ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40'
                : 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-cyan-500/40'
            }`}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
        </div>
      </div>
    </div>
  );
}
