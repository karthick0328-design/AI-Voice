class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.currentUtterance = null;
    this.voices = [];
    this.maleVoice = null;
    this.femaleVoice = null;
    this.isUnlocked = false;
    this.silenceTimer = null;
    this.initVoices();
  }

  initRecognition() {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      return recognition;
    }
    return null;
  }

  initVoices() {
    if (!this.synthesis) return;
    const updateVoices = () => {
      this.voices = this.synthesis.getVoices() || [];
      if (this.voices.length > 0) {
        // Cache male & female voices (covering Windows, macOS, iOS Safari, Android Chrome)
        this.maleVoice =
          this.voices.find(
            (v) =>
              (v.name.includes('David') ||
                v.name.includes('Mark') ||
                v.name.includes('George') ||
                v.name.includes('Guy') ||
                v.name.includes('Daniel') ||
                v.name.includes('Oliver') ||
                v.name.includes('Arthur') ||
                v.name.includes('Male') ||
                v.name.toLowerCase().includes('male')) &&
              v.lang.startsWith('en')
          ) ||
          this.voices.find((v) => v.lang.startsWith('en')) ||
          this.voices[0];

        this.femaleVoice =
          this.voices.find(
            (v) =>
              (v.name.includes('Zira') ||
                v.name.includes('Hazel') ||
                v.name.includes('Jenny') ||
                v.name.includes('Aria') ||
                v.name.includes('Samantha') ||
                v.name.includes('Karen') ||
                v.name.includes('Victoria') ||
                v.name.includes('Moira') ||
                v.name.includes('Female') ||
                v.name.toLowerCase().includes('female')) &&
              v.lang.startsWith('en')
          ) ||
          this.voices.find((v) => v.lang.startsWith('en')) ||
          this.voices[0];
      }
    };

    updateVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = updateVoices;
    }
  }

  unlock() {
    if (this.synthesis && !this.isUnlocked) {
      try {
        const utterance = new SpeechSynthesisUtterance(' ');
        utterance.volume = 0.01;
        this.synthesis.speak(utterance);
        this.isUnlocked = true;
      } catch (e) {}
    }
  }

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening({ onTranscript, onError, onEnd }) {
    this.unlock();

    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch (e) {}
      }
      this.recognition = this.initRecognition();
      if (!this.recognition) {
        if (onError) onError(new Error('Speech recognition not supported in this browser.'));
        return false;
      }

      let finalTranscript = '';
      let interimTranscript = '';
      let hasSubmitted = false;

      const submitTranscript = (text) => {
        if (hasSubmitted || !text.trim()) return;
        hasSubmitted = true;
        this.stopListening();
        if (onTranscript) {
          onTranscript({
            interim: '',
            final: text.trim(),
            text: text.trim()
          });
        }
      };

      this.recognition.onresult = (event) => {
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += ' ' + transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = (finalTranscript + ' ' + interimTranscript).trim();
        if (onTranscript) {
          onTranscript({
            interim: interimTranscript,
            final: '',
            text: currentText
          });
        }

        // Automatic smart pause detection (if user stops speaking for 1.2s, submit)
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        if (currentText.length > 1) {
          this.silenceTimer = setTimeout(() => {
            submitTranscript(currentText);
          }, 1200);
        }
      };

      this.recognition.onerror = (event) => {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('[SpeechService] Recognition error:', event.error);
        }
        this.isListening = false;
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.isListening = false;
        const currentText = (finalTranscript + ' ' + interimTranscript).trim();
        if (currentText && !hasSubmitted) {
          submitTranscript(currentText);
        } else if (onEnd) {
          onEnd();
        }
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
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
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

  speak(text, { speed = 1.05, gender = 'boy', onStart, onEnd, onError } = {}) {
    this.unlock();
    if (!this.synthesis) {
      if (onError) onError(new Error('Speech synthesis not available'));
      return;
    }

    try {
      if (this.synthesis.speaking) {
        this.synthesis.cancel();
      }
      if (this.synthesis.paused) {
        this.synthesis.resume();
      }
    } catch (e) {}

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.6, Math.min(1.8, speed));

    if (!this.maleVoice || !this.femaleVoice) {
      this.initVoices();
    }

    if (gender === 'boy' || gender === 'male') {
      utterance.pitch = 0.92;
      if (this.maleVoice) utterance.voice = this.maleVoice;
    } else {
      utterance.pitch = 1.2;
      if (this.femaleVoice) utterance.voice = this.femaleVoice;
    }

    let hasEnded = false;
    const finish = () => {
      if (!hasEnded) {
        hasEnded = true;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = finish;

    utterance.onerror = (e) => {
      console.warn('[SpeechService] speak error:', e);
      finish();
    };

    this.currentUtterance = utterance;

    try {
      this.synthesis.speak(utterance);
    } catch (err) {
      console.error('[SpeechService] speak invocation error:', err);
      finish();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {}
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
