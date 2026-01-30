import { fireEvent, render } from '@testing-library/react-native';
import { useAudioStore } from '../../src/stores/useAudioStore';

process.env.EXPO_PUBLIC_USE_MOCK_AUDIO = 'false';
const FreeplayScreen = require('../../app/(tabs)/freeplay').default;

describe('FreeplayScreen', () => {
  beforeEach(() => {
    useAudioStore.setState({
      isListening: false,
      currentChord: null,
      chordHistory: [],
      error: null,
    });
  });

  it('toggles listening state from the start button', () => {
    const { getByText, queryByText } = render(<FreeplayScreen />);

    expect(getByText('Start Listening')).toBeTruthy();
    expect(queryByText('Stop Listening')).toBeNull();

    fireEvent.press(getByText('Start Listening'));

    expect(getByText('Stop Listening')).toBeTruthy();
  });
});
