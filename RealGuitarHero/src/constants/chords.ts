import { Chord } from '../types';

export const chords: Chord[] = [
  // Major chords
  {
    id: 'c-major',
    primaryName: 'C',
    alternateNames: ['Cmaj', 'CM'],
    type: 'major',
    difficulty: 'beginner',
    notes: ['C', 'E', 'G'],
    diagram: {
      strings: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      baseFret: 0,
    },
  },
  {
    id: 'd-major',
    primaryName: 'D',
    alternateNames: ['Dmaj', 'DM'],
    type: 'major',
    difficulty: 'beginner',
    notes: ['D', 'F#', 'A'],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
      baseFret: 0,
    },
  },
  {
    id: 'e-major',
    primaryName: 'E',
    alternateNames: ['Emaj', 'EM'],
    type: 'major',
    difficulty: 'beginner',
    notes: ['E', 'G#', 'B'],
    diagram: {
      strings: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'g-major',
    primaryName: 'G',
    alternateNames: ['Gmaj', 'GM'],
    type: 'major',
    difficulty: 'beginner',
    notes: ['G', 'B', 'D'],
    diagram: {
      strings: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      baseFret: 0,
    },
  },
  {
    id: 'a-major',
    primaryName: 'A',
    alternateNames: ['Amaj', 'AM'],
    type: 'major',
    difficulty: 'beginner',
    notes: ['A', 'C#', 'E'],
    diagram: {
      strings: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      baseFret: 0,
    },
  },
  // Minor chords
  {
    id: 'a-minor',
    primaryName: 'Am',
    alternateNames: ['Amin'],
    type: 'minor',
    difficulty: 'beginner',
    notes: ['A', 'C', 'E'],
    diagram: {
      strings: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      baseFret: 0,
    },
  },
  {
    id: 'd-minor',
    primaryName: 'Dm',
    alternateNames: ['Dmin'],
    type: 'minor',
    difficulty: 'beginner',
    notes: ['D', 'F', 'A'],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
      baseFret: 0,
    },
  },
  {
    id: 'e-minor',
    primaryName: 'Em',
    alternateNames: ['Emin'],
    type: 'minor',
    difficulty: 'beginner',
    notes: ['E', 'G', 'B'],
    diagram: {
      strings: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
      baseFret: 0,
    },
  },
  // 7th chords
  {
    id: 'a7',
    primaryName: 'A7',
    alternateNames: ['Adom7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['A', 'C#', 'E', 'G'],
    diagram: {
      strings: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 0, 1, 0, 2, 0],
      baseFret: 0,
    },
  },
  {
    id: 'e7',
    primaryName: 'E7',
    alternateNames: ['Edom7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['E', 'G#', 'B', 'D'],
    diagram: {
      strings: [0, 2, 0, 1, 0, 0],
      fingers: [0, 2, 0, 1, 0, 0],
      baseFret: 0,
    },
  },
];

// Helper function to find chord by name
export function findChordByName(name: string): Chord | undefined {
  const normalizedName = name.toLowerCase().trim();
  return chords.find(
    (chord) =>
      chord.primaryName.toLowerCase() === normalizedName ||
      chord.alternateNames.some((alt) => alt.toLowerCase() === normalizedName)
  );
}

// Helper function to get chords by type
export function getChordsByType(type: Chord['type']): Chord[] {
  return chords.filter((chord) => chord.type === type);
}

// Helper function to get chords by difficulty
export function getChordsByDifficulty(difficulty: Chord['difficulty']): Chord[] {
  return chords.filter((chord) => chord.difficulty === difficulty);
}
