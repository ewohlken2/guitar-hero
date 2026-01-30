import { create } from 'zustand';
import { DetectedChord } from '../types';

interface AudioState {
  isListening: boolean;
  currentChord: DetectedChord | null;
  chordHistory: DetectedChord[];
  error: string | null;

  // Actions
  setListening: (value: boolean) => void;
  setCurrentChord: (chord: DetectedChord | null) => void;
  addToHistory: (chord: DetectedChord) => void;
  clearHistory: () => void;
  setError: (error: string | null) => void;
}

const MAX_HISTORY = 8;

export const useAudioStore = create<AudioState>((set) => ({
  isListening: false,
  currentChord: null,
  chordHistory: [],
  error: null,

  setListening: (value) => set({ isListening: value }),

  setCurrentChord: (chord) => set({ currentChord: chord }),

  addToHistory: (chord) =>
    set((state) => ({
      chordHistory: [chord, ...state.chordHistory].slice(0, MAX_HISTORY),
    })),

  clearHistory: () => set({ chordHistory: [] }),

  setError: (error) => set({ error }),
}));
