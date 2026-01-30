import { create } from 'zustand';
import { Song, HitType } from '../types';

interface GameState {
  currentSong: Song | null;
  currentLevel: number;
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  isPlaying: boolean;

  // Actions
  setSong: (song: Song) => void;
  setLevel: (level: number) => void;
  startGame: () => void;
  endGame: () => void;
  addHit: (type: HitType) => void;
  addMiss: () => void;
  reset: () => void;
}

const getComboMultiplier = (combo: number): number => {
  if (combo >= 50) return 4;
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  return 1;
};

const getPointsForHit = (type: HitType): number => {
  switch (type) {
    case 'perfect':
      return 100;
    case 'good':
      return 50;
    default:
      return 0;
  }
};

const initialState = {
  currentSong: null,
  currentLevel: 1,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  misses: 0,
  isPlaying: false,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setSong: (song) => set({ currentSong: song }),

  setLevel: (level) => set({ currentLevel: level }),

  startGame: () => set({ isPlaying: true, score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0 }),

  endGame: () => set({ isPlaying: false }),

  addHit: (type) =>
    set((state) => {
      const newCombo = state.combo + 1;
      const multiplier = getComboMultiplier(state.combo); // Use current combo for multiplier
      const points = getPointsForHit(type) * multiplier;

      return {
        score: state.score + points,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        hits: state.hits + 1,
      };
    }),

  addMiss: () =>
    set((state) => ({
      combo: 0,
      misses: state.misses + 1,
    })),

  reset: () => set(initialState),
}));
