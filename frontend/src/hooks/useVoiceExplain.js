import { useState, useEffect, useRef, useCallback } from 'react';

const useVoiceExplain = () => {
  const [state, setState] = useState('idle'); // idle | speaking | paused
  const utteranceRef = useRef(null);
  const keepAliveRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    clearInterval(keepAliveRef.current);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    clearInterval(keepAliveRef.current);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick best English voice
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.lang === 'en-US' && v.localService) ||
        voices.find(v => v.lang.startsWith('en') && v.localService) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      if (preferred) utterance.voice = preferred;
    };

    // Voices may not be loaded yet on first call
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { setVoice(); window.speechSynthesis.onvoiceschanged = null; };
    } else {
      setVoice();
    }

    utterance.onstart  = () => setState('speaking');
    utterance.onpause  = () => setState('paused');
    utterance.onresume = () => setState('speaking');
    utterance.onend    = () => { setState('idle'); clearInterval(keepAliveRef.current); };
    utterance.onerror  = () => { setState('idle'); clearInterval(keepAliveRef.current); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState('speaking');

    // Chrome bug fix: speechSynthesis pauses itself after ~15s on long text
    // Keep-alive: pause+resume every 10s to prevent the browser from cutting it off
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    clearInterval(keepAliveRef.current);
    setState('paused');
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setState('speaking');
    // Restart keep-alive after manual resume
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearInterval(keepAliveRef.current);
    setState('idle');
  }, []);

  return {
    speak, pause, resume, stop, state,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
};

export default useVoiceExplain;
