class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.currentUtterance = null;
    this.voices = [];
    this.maleVoice = null;
    this.femaleVoice = null;
    this.isUnlocked = false;
    this.initRecognition();
    this.initVoices();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  initVoices() {
    if (this.synthesis) {
      const updateVoices = () => {
        this.voices = this.synthesis.getVoices() || [];
        if (this.voices.length > 0) {
          // Cache male & female voices upfront for 0ms latency
          this.maleVoice = this.voices.find(v => 
            (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('George') || 
             v.name.includes('Guy') || v.name.includes('Male') || v.name.includes('Desktop - English (United States)')) && 
            v.lang.startsWith('en')
          ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];

          this.femaleVoice = this.voices.find(v => 
            (v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Jenny') || 
             v.name.includes('Aria') || v.name.includes('Female') || v.name.includes('Sonia') ||
             v.name.includes('Google UK English Female')) && 
            v.lang.startsWith('en')
          ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        }
      };
      updateVoices();
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  unlock() {
    if (this.synthesis && !this.isUnlocked) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      this.synthesis.speak(utterance);
      this.isUnlocked = true;
    }
  }

  isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening({ onTranscript, onError, onEnd }) {
    if (!this.recognition) {
      if (onError) onError(new Error('Speech recognition is not supported in this browser.'));
      return false;
    }
    if (this.isListening) {
      return true;
    }

    try {
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (onTranscript) {
          onTranscript({
            interim: interimTranscript,
            final: finalTranscript,
            text: finalTranscript || interimTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('[SpeechService] Recognition error:', event.error);
        }
        this.isListening = false;
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.error('[SpeechService] Start error:', err);
      this.isListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  sanitizeTextForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[#*_~>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Zero-latency instant speech execution
   */
  speak(text, { speed = 1.05, gender = 'boy', voiceName = '', onStart, onEnd, onError } = {}) {
    if (!this.synthesis) {
      if (onError) onError(new Error('Speech synthesis not available'));
      return;
    }

    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.5, Math.min(2.0, speed));

    if (gender === 'boy' || gender === 'male') {
      utterance.pitch = 0.92;
      if (this.maleVoice) utterance.voice = this.maleVoice;
    } else {
      utterance.pitch = 1.2;
      if (this.femaleVoice) utterance.voice = this.femaleVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  getAvailableVoices() {
    return this.voices.length > 0 ? this.voices : this.synthesis ? this.synthesis.getVoices() : [];
  }
}

export const speechService = new SpeechService();
