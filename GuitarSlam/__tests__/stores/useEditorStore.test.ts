import { act } from "@testing-library/react-native";
import { useEditorStore } from "../../src/stores/useEditorStore";

describe("useEditorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("creates a new song with defaults", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test Song", "Test Artist", 120);
    });
    const state = useEditorStore.getState();
    expect(state.song?.title).toBe("Test Song");
    expect(state.song?.bpm).toBe(120);
    expect(state.song?.isUserCreated).toBe(true);
  });

  it("adds a chord note", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });
    const state = useEditorStore.getState();
    expect(state.song?.levels[0].chart.length).toBe(1);
    expect(state.song?.levels[0].chart[0].chord).toBe("G");
    expect(state.isDirty).toBe(true);
  });

  it("supports undo/redo for note operations", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });
    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(1);
    act(() => { useEditorStore.getState().undo(); });
    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(0);
    act(() => { useEditorStore.getState().redo(); });
    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(1);
  });

  it("deletes a note", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });
    const noteId = useEditorStore.getState().song?.levels[0].chart[0].id;
    act(() => { useEditorStore.getState().deleteNote(noteId!); });
    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(0);
  });

  it("moves a note to new time", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });
    const noteId = useEditorStore.getState().song?.levels[0].chart[0].id;
    act(() => { useEditorStore.getState().moveNote(noteId!, 4); });
    expect(useEditorStore.getState().song?.levels[0].chart[0].time).toBe(4);
  });

  it("resizes a note duration", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });
    const noteId = useEditorStore.getState().song?.levels[0].chart[0].id;
    act(() => { useEditorStore.getState().resizeNote(noteId!, 4); });
    expect(useEditorStore.getState().song?.levels[0].chart[0].duration).toBe(4);
  });

  it("snaps time to grid based on BPM and subdivision", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().setSnapToGrid(true);
      useEditorStore.getState().setGridSubdivision(4);
    });
    // At 120 BPM, one beat = 0.5 seconds, subdivision 4 = 0.125 seconds
    const snapped = useEditorStore.getState().snapTimeToGrid(0.3);
    expect(snapped).toBe(0.25);
  });
});
