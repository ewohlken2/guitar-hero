import { act } from '@testing-library/react-native';
import { useAudioStore } from '../../src/stores/useAudioStore';

describe('useAudioStore', () => {
  it('sets current chord and adds to history', () => {
    const chord = { name: 'G', confidence: 0.8, notes: ['G', 'B', 'D'], timestamp: 123 };

    act(() => {
      useAudioStore.getState().setCurrentChord(chord);
      useAudioStore.getState().addToHistory(chord);
    });

    const state = useAudioStore.getState();
    expect(state.currentChord?.name).toBe('G');
    expect(state.chordHistory[0]?.name).toBe('G');
  });
});
