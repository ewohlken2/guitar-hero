import { useCallback, useEffect, useRef } from 'react';
import { useAudioStore } from '../stores/useAudioStore';
import { getMockDetectedChord } from '../utils/mockAudio';

const TICK_MS = 900;

export const useMockAudioDetection = () => {
  const {
    isListening,
    currentChord,
    chordHistory,
    setListening,
    setCurrentChord,
    addToHistory,
    setError,
  } = useAudioStore();
  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setError(null);
    setListening(true);
  }, [setError, setListening]);

  const stop = useCallback(() => {
    setListening(false);
  }, [setListening]);

  useEffect(() => {
    if (!isListening) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const chord = getMockDetectedChord(indexRef.current);
      indexRef.current += 1;
      setCurrentChord(chord);
      addToHistory(chord);
    }, TICK_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isListening, setCurrentChord, addToHistory]);

  return {
    isListening,
    currentChord,
    chordHistory,
    start,
    stop,
  };
};
