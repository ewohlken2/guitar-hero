import { chords } from '../constants/chords';
import { DetectedChord } from '../types';

export const getMockDetectedChord = (index: number, timestamp = Date.now()): DetectedChord => {
  const chord = chords[index % chords.length];

  return {
    name: chord.primaryName,
    confidence: 0.82,
    notes: chord.notes,
    timestamp,
  };
};
