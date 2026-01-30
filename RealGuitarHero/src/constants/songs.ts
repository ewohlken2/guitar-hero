import { Song } from '../types';

export const sampleSongs: Song[] = [
  {
    id: 'song-1',
    title: 'Chord Parade',
    artist: 'Practice Crew',
    difficulty: 2,
    bpm: 90,
    levels: [
      {
        levelNumber: 1,
        name: 'Warmup',
        description: 'Open chords at an easy tempo',
        chart: [
          { id: 's1-n1', chord: 'C', time: 1.0, duration: 1.5 },
          { id: 's1-n2', chord: 'G', time: 3.0, duration: 1.5 },
          { id: 's1-n3', chord: 'Am', time: 5.0, duration: 1.5 },
          { id: 's1-n4', chord: 'F', time: 7.0, duration: 1.5 },
          { id: 's1-n5', chord: 'C', time: 9.0, duration: 1.5 },
          { id: 's1-n6', chord: 'G', time: 11.0, duration: 1.5 },
        ],
      },
    ],
  },
  {
    id: 'song-2',
    title: 'Midnight Strum',
    artist: 'Open Strings',
    difficulty: 3,
    bpm: 110,
    levels: [
      {
        levelNumber: 1,
        name: 'Moonlight',
        description: 'Smooth changes with steady timing',
        chart: [
          { id: 's2-n1', chord: 'Em', time: 1.0, duration: 1.0 },
          { id: 's2-n2', chord: 'G', time: 2.5, duration: 1.0 },
          { id: 's2-n3', chord: 'D', time: 4.0, duration: 1.0 },
          { id: 's2-n4', chord: 'C', time: 5.5, duration: 1.0 },
          { id: 's2-n5', chord: 'Em', time: 7.0, duration: 1.0 },
          { id: 's2-n6', chord: 'G', time: 8.5, duration: 1.0 },
          { id: 's2-n7', chord: 'D', time: 10.0, duration: 1.0 },
        ],
      },
    ],
  },
  {
    id: 'song-3',
    title: 'Campfire Loop',
    artist: 'Strum Circle',
    difficulty: 1,
    bpm: 80,
    levels: [
      {
        levelNumber: 1,
        name: 'Easy Loop',
        description: 'Slow and steady practice',
        chart: [
          { id: 's3-n1', chord: 'A', time: 1.0, duration: 2.0 },
          { id: 's3-n2', chord: 'D', time: 4.0, duration: 2.0 },
          { id: 's3-n3', chord: 'E', time: 7.0, duration: 2.0 },
          { id: 's3-n4', chord: 'A', time: 10.0, duration: 2.0 },
        ],
      },
    ],
  },
];
