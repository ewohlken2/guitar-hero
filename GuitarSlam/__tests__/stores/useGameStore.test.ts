import { useGameStore } from '../../src/stores/useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should start with initial state', () => {
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it('should add score with combo multiplier', () => {
    const { addHit } = useGameStore.getState();

    // First hit: 1x multiplier
    addHit('perfect');
    expect(useGameStore.getState().score).toBe(100);
    expect(useGameStore.getState().combo).toBe(1);

    // More hits to build combo
    for (let i = 0; i < 9; i++) {
      addHit('perfect');
    }
    // 10th hit: now at 2x multiplier
    expect(useGameStore.getState().combo).toBe(10);

    addHit('perfect');
    // 11th hit with 2x: 100 * 2 = 200 added
    expect(useGameStore.getState().score).toBe(1000 + 200);
  });

  it('should reset combo on miss', () => {
    const { addHit, addMiss } = useGameStore.getState();

    addHit('perfect');
    addHit('perfect');
    expect(useGameStore.getState().combo).toBe(2);

    addMiss();
    expect(useGameStore.getState().combo).toBe(0);
    expect(useGameStore.getState().misses).toBe(1);
  });

  it('should track max combo', () => {
    const { addHit, addMiss } = useGameStore.getState();

    for (let i = 0; i < 5; i++) {
      addHit('perfect');
    }
    expect(useGameStore.getState().maxCombo).toBe(5);

    addMiss();
    addHit('perfect');
    addHit('perfect');

    // Max combo should still be 5
    expect(useGameStore.getState().maxCombo).toBe(5);
    expect(useGameStore.getState().combo).toBe(2);
  });
});
