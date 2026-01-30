import { useEffect } from 'react';
import { addListener, startListening, stopListening } from '../../modules/audio-detection';
import { useAudioStore } from '../stores/useAudioStore';
import { matchChordFromNotes } from '../utils/chordMatching';
import { chords } from '../constants/chords';

export const useAudioDetection = () => {
  const { setListening, setCurrentChord, addToHistory, setError } = useAudioStore();

  useEffect(() => {
    const subscription = addListener((event) => {
      const match = matchChordFromNotes(event.pitches, chords, event.timestamp);
      if (!match) return;

      const chord = {
        name: match.chord.primaryName,
        confidence: match.score,
        notes: match.chord.notes,
        timestamp: match.timestamp,
      };

      setCurrentChord(chord);
      addToHistory(chord);
    });

    return () => subscription.remove();
  }, [addToHistory, setCurrentChord]);

  return {
    start: () => {
      setError(null);
      setListening(true);
      startListening();
    },
    stop: () => {
      setListening(false);
      stopListening();
    },
  };
};
