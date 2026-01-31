import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import UserSongsScreen from '../../../app/songs/index';
import { UserSong } from '../../../src/types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useFocusEffect: (callback: () => void) => {
    const cleanup = callback();
    return cleanup;
  },
}));

jest.mock('../../../src/services/songStorage', () => ({
  loadUserSongs: jest.fn().mockResolvedValue([]),
  deleteUserSong: jest.fn().mockResolvedValue(undefined),
}));

const { loadUserSongs } = jest.requireMock('../../../src/services/songStorage');

describe('UserSongsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no songs exist', async () => {
    loadUserSongs.mockResolvedValueOnce([]);

    const screen = render(<UserSongsScreen />);

    await waitFor(() => {
      expect(screen.getByText('No Songs Yet')).toBeTruthy();
    });
  });

  it('renders songs when available', async () => {
    const songs: UserSong[] = [
      {
        id: 'song-1',
        title: 'My Song',
        artist: 'Artist',
        bpm: 120,
        difficulty: 2,
        levels: [
          {
            levelNumber: 1,
            name: 'Full Song',
            description: 'Test',
            chart: [{ id: 'note-1', chord: 'G', time: 0, duration: 2 }],
          },
        ],
        isUserCreated: true,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    loadUserSongs.mockResolvedValue(songs);

    const screen = render(<UserSongsScreen />);

    await waitFor(() => {
      expect(screen.getByText('My Song')).toBeTruthy();
      expect(screen.getByText('Artist')).toBeTruthy();
    });
  });

  it('renders create button', async () => {
    loadUserSongs.mockResolvedValueOnce([]);

    const screen = render(<UserSongsScreen />);

    await waitFor(() => {
      expect(screen.getByText('+ Create New Song')).toBeTruthy();
    });
  });
});
