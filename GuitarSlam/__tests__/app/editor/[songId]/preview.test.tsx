import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PreviewScreen from '../../../../app/editor/[songId]/preview';
import { useEditorStore } from '../../../../src/stores/useEditorStore';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ songId: 'song-1' }),
}));

declare global {
  // eslint-disable-next-line no-var
  var requestAnimationFrame: (callback: FrameRequestCallback) => number;
  // eslint-disable-next-line no-var
  var cancelAnimationFrame: (handle: number) => void;
}

describe('PreviewScreen', () => {
  beforeAll(() => {
    global.requestAnimationFrame = () => 1;
    global.cancelAnimationFrame = () => {};
  });

  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it('renders an error when no song is loaded', () => {
    const { getByText } = render(<PreviewScreen />);
    expect(getByText('No song to preview')).toBeTruthy();
  });

  it('renders song metadata and play controls when song is loaded', () => {
    useEditorStore.getState().createNewSong('Preview Song', 'Preview Artist', 120);
    useEditorStore.getState().addNote('G', 0, 2);

    const { getByText } = render(<PreviewScreen />);

    expect(getByText('Preview Song')).toBeTruthy();
    expect(getByText('Preview Artist - 120 BPM')).toBeTruthy();
    expect(getByText('Play Preview')).toBeTruthy();
  });

  it('toggles play/stop controls', () => {
    useEditorStore.getState().createNewSong('Preview Song', 'Preview Artist', 120);
    useEditorStore.getState().addNote('G', 0, 2);

    const { getByText, queryByText } = render(<PreviewScreen />);

    fireEvent.press(getByText('Play Preview'));
    expect(queryByText('Stop')).toBeTruthy();
  });
});
