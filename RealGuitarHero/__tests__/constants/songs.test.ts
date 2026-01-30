import { sampleSongs } from '../../src/constants/songs';

describe('sampleSongs', () => {
  it('includes at least 3 songs with charts', () => {
    expect(sampleSongs.length).toBeGreaterThanOrEqual(3);
    sampleSongs.forEach((song) => {
      expect(song.levels.length).toBeGreaterThan(0);
      song.levels.forEach((level) => {
        expect(level.chart.length).toBeGreaterThan(0);
      });
    });
  });

  it('has non-decreasing time order per chart', () => {
    sampleSongs.forEach((song) => {
      song.levels.forEach((level) => {
        const times = level.chart.map((note) => note.time);
        const sorted = [...times].sort((a, b) => a - b);
        expect(times).toEqual(sorted);
      });
    });
  });
});
