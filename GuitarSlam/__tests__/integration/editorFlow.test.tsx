import { act } from "@testing-library/react-native";
import { useEditorStore } from "../../src/stores/useEditorStore";
import {
  saveUserSong,
  getAllUserSongs,
  deleteUserSong,
} from "../../src/services/songStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("Editor Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEditorStore.getState().reset();
  });

  it("creates a song, adds notes, and saves", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Create song
    act(() => {
      useEditorStore
        .getState()
        .createNewSong("Integration Test", "Test Artist", 120);
    });

    const song1 = useEditorStore.getState().song;
    expect(song1?.title).toBe("Integration Test");

    // Add notes
    act(() => {
      useEditorStore.getState().addNote("G", 0, 2);
      useEditorStore.getState().addNote("C", 2, 2);
      useEditorStore.getState().addNote("D", 4, 2);
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(3);

    // Save
    const songToSave = useEditorStore.getState().song!;
    await saveUserSong(songToSave);

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("supports undo across multiple operations", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Undo Test", "Artist", 100);
      useEditorStore.getState().addNote("Am", 0, 2);
      useEditorStore.getState().addNote("Em", 2, 2);
      useEditorStore.getState().addNote("G", 4, 2);
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(3);

    // Undo all three
    act(() => {
      useEditorStore.getState().undo();
      useEditorStore.getState().undo();
      useEditorStore.getState().undo();
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(0);

    // Redo one
    act(() => {
      useEditorStore.getState().redo();
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(1);
  });

  it("tracks dirty state correctly", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Dirty Test", "Artist", 120);
    });

    expect(useEditorStore.getState().isDirty).toBe(false);

    act(() => {
      useEditorStore.getState().addNote("G", 0, 2);
    });

    expect(useEditorStore.getState().isDirty).toBe(true);

    act(() => {
      useEditorStore.getState().markClean();
    });

    expect(useEditorStore.getState().isDirty).toBe(false);
  });
});
