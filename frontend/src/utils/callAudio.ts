// Web Audio API and Web Speech API utility for AgriChain Calling Agent

class CallAudioManager {
  private audioCtx: AudioContext | null = null;
  private ringOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }[] = [];
  private ringInterval: any = null;
  private isMuted: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
      if (this.availableVoices.length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ==========================================
  // TELEPHONY SOUND SYNTHESIZER (Web Audio API)
  // ==========================================

  /**
   * Synthesize realistic PBX telephone ringback tone (dual frequency: 440Hz + 480Hz)
   * Plays standard cadence: 1.8s tone, followed by 3.2s silence
   */
  startRingbackTone(): () => void {
    if (this.isMuted) return () => {};

    const ctx = this.getAudioContext();
    if (!ctx) return () => {};

    let isPlaying = true;

    const playBurst = () => {
      if (!isPlaying || !ctx || ctx.state === 'closed') return;

      try {
        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
        gainNode.gain.setValueAtTime(0.12, now + 1.8);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.85);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();

        // 440 Hz + 480 Hz: US/Indian standard audible ringing tone
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.85);
        osc2.stop(now + 1.85);
      } catch (err) {
        console.warn('Ringback tone error:', err);
      }
    };

    // First burst immediately
    playBurst();
    // Repeat every 4.5 seconds
    const interval = setInterval(playBurst, 4500);

    return () => {
      isPlaying = false;
      clearInterval(interval);
    };
  }

  /**
   * Synthesize a phone pickup connection chirp
   */
  playConnectChirp() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1050, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (err) {
      console.warn('Connect chirp error:', err);
    }
  }

  /**
   * Synthesize a disconnect / hangup tone
   */
  playDisconnectTone() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.frequency.setValueAtTime(480, now);
      osc2.frequency.setValueAtTime(620, now);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (err) {
      console.warn('Disconnect tone error:', err);
    }
  }

  // ==========================================
  // TEXT-TO-SPEECH (Web Speech API)
  // ==========================================

  getBestVoice(isAi: boolean, preferredLang: 'hi' | 'en' = 'hi'): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.initVoices();
    }

    const voices = this.availableVoices;
    if (voices.length === 0) return null;

    if (preferredLang === 'hi') {
      // Look for Hindi voice
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) return hindiVoice;
    }

    // Look for Indian English voice
    const indianVoice = voices.find(
      (v) => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')
    );
    if (indianVoice) return indianVoice;

    // Female/clear voice for AI
    if (isAi) {
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('zira')
      );
      if (femaleVoice) return femaleVoice;
    } else {
      // Male / deeper voice for Farmer
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('mark')
      );
      if (maleVoice) return maleVoice;
    }

    return voices[0] || null;
  }

  /**
   * Speaks a line of text aloud with realistic pitch and rate
   */
  speak(options: {
    text: string;
    isAi: boolean;
    rate?: number;
    preferredLang?: 'hi' | 'en';
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): () => void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onStart) options.onStart();
      if (options.onEnd) setTimeout(options.onEnd, 1500);
      return () => {};
    }

    if (this.isMuted) {
      if (options.onStart) options.onStart();
      if (options.onEnd) setTimeout(options.onEnd, 1500);
      return () => {};
    }

    // Stop any current utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    const voice = this.getBestVoice(options.isAi, options.preferredLang || 'hi');
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = options.preferredLang === 'hi' ? 'hi-IN' : 'en-IN';
    }

    // AI agent vs Farmer pitch & cadence
    if (options.isAi) {
      utterance.pitch = 1.05; // clear, pleasant assistant pitch
      utterance.rate = options.rate || 0.96; // calm, articulate pace
    } else {
      utterance.pitch = 0.88; // deeper, rustic tone for farmer
      utterance.rate = options.rate || 0.92;
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      if (options.onEnd) options.onEnd();
      if (options.onError) options.onError(e);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Failed to call window.speechSynthesis.speak:', e);
      if (options.onEnd) options.onEnd();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const callAudio = new CallAudioManager();
