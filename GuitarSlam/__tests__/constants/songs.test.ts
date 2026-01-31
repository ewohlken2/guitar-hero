import { songs } from '../../src/constants/songs';

describe('songs data', () => {
  it('contains at least 10 songs', () => {
    expect(songs.length).toBeGreaterThanOrEqual(10);
  });

  it('each song has at least 2 levels', () => {
    songs.forEach((song) => {
      expect(song.levels.length).toBeGreaterThanOrEqual(2);
    });
  });
});
