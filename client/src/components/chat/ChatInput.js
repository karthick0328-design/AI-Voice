import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Square, Sparkles } from 'lucide-react';
import { speechService } from '../../services/speechService.js';
import { useAgent } from '../../context/AgentContext.js';

export function ChatInput({ onSendMessage, isStreaming, onStopStream }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const { setAiState, setStatusText } = useAgent();
  const textareaRef = useRef(null);

  useEffect(() => {
    setSpeechSupported(speechService.isSpeechRecognitionSupported());
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setAiState('IDLE');
      setStatusText('Agent Online & Ready');
    } else {
      setIsListening(true);
      setAiState('LISTENING');
      setStatusText('Listening to voice input...');

      speechService.startListening({
        onTranscript: ({ text }) => {
          setInputText(text);
        },
        onError: (err) => {
          console.warn('Voice recognition error:', err);
          setIsListening(false);
          setAiState('IDLE');
          setStatusText('Voice input stopped');
        },
        onEnd: () => {
          setIsListening(false);
          setAiState('IDLE');
          setStatusText('Agent Online & Ready');
        }
      });
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isStreaming) return;
    if (!inputText.trim()) return;

    // Unlock speech synthesis on user interaction
    speechService.unlock();

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }

    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Quick Prompt Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        <button
          type="button"
          onClick={() => setInputText('What are the latest AI developments this week?')}
          className="px-3 py-1 rounded-full bg-dark-900 border border-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 whitespace-nowrap transition-all"
        >
          <Sparkles className="w-3 h-3 inline mr-1 text-cyan-400" />
          Search AI News
        </button>
        <button
          type="button"
          onClick={() => setInputText('Remind me tomorrow at 10 AM to review project deliverables.')}
          className="px-3 py-1 rounded-full bg-dark-900 border border-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 whitespace-nowrap transition-all"
        >
          Create Reminder
        </button>
        <button
          type="button"
          onClick={() => setInputText('Remember that I prefer TypeScript and clean architecture.')}
          className="px-3 py-1 rounded-full bg-dark-900 border border-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 whitespace-nowrap transition-all"
        >
          Save Memory
        </button>
        <button
          type="button"
          onClick={() => setInputText('Calculate (145 * 28) / 4 + 500')}
          className="px-3 py-1 rounded-full bg-dark-900 border border-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 whitespace-nowrap transition-all"
        >
          Calculator
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center glass-panel rounded-2xl p-2 border border-white/10 focus-within:border-cyan-500/50 shadow-2xl">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... Speak naturally" : "Ask Aether anything, run tools, or speak..."}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none resize-none overflow-y-auto max-h-32 leading-relaxed"
        />

        <div className="flex items-center space-x-1.5 pr-2">
          {/* Voice Microphone Toggle */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Stop streaming button OR Send Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStream}
              className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition-all"
              title="Stop generating"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-30 disabled:hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
