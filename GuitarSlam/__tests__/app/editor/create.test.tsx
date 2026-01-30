import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import CreateSongScreen from "../../../app/editor/create";
import { useEditorStore } from "../../../src/stores/useEditorStore";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock songStorage
jest.mock("../../../src/services/songStorage", () => ({
  saveUserSong: jest.fn().mockResolvedValue(undefined),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("CreateSongScreen", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(<CreateSongScreen />);
    // Should have toolbar buttons
    expect(getByTestId("undo-button")).toBeTruthy();
    expect(getByTestId("save-button")).toBeTruthy();
  });

  it("initializes a new song on mount", async () => {
    render(<CreateSongScreen />);

    await waitFor(() => {
      const state = useEditorStore.getState();
      expect(state.song).not.toBeNull();
      expect(state.song?.title).toBe("Untitled Song");
      expect(state.song?.isUserCreated).toBe(true);
    });
  });

  it("renders the metadata form with song details", async () => {
    const { getByPlaceholderText, getByText } = render(<CreateSongScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Song title")).toBeTruthy();
      expect(getByPlaceholderText("Artist name")).toBeTruthy();
      expect(getByText("120")).toBeTruthy(); // Default BPM
    });
  });

  it("renders the chord palette", () => {
    const { getByText } = render(<CreateSongScreen />);

    // Quick access chords should be visible
    expect(getByText("G")).toBeTruthy();
    expect(getByText("C")).toBeTruthy();
    expect(getByText("D")).toBeTruthy();
  });

  it("renders the timeline grid", () => {
    const { getByTestId } = render(<CreateSongScreen />);
    expect(getByTestId("timeline-grid")).toBeTruthy();
  });

  it("shows alert when trying to save empty song", async () => {
    const { getByTestId } = render(<CreateSongScreen />);

    await waitFor(() => {
      expect(useEditorStore.getState().song).not.toBeNull();
    });

    fireEvent.press(getByTestId("save-button"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Cannot Save",
      "Please add at least one chord to your song."
    );
  });

  it("shows alert when trying to preview empty song", async () => {
    const { getByTestId } = render(<CreateSongScreen />);

    await waitFor(() => {
      expect(useEditorStore.getState().song).not.toBeNull();
    });

    fireEvent.press(getByTestId("preview-button"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Cannot Preview",
      "Please add at least one chord to your song."
    );
  });

  it("updates song title when changed", async () => {
    const { getByPlaceholderText } = render(<CreateSongScreen />);

    await waitFor(() => {
      expect(useEditorStore.getState().song).not.toBeNull();
    });

    fireEvent.changeText(getByPlaceholderText("Song title"), "My New Song");

    expect(useEditorStore.getState().song?.title).toBe("My New Song");
  });

  it("toggles snap to grid when snap button pressed", async () => {
    const { getByTestId } = render(<CreateSongScreen />);

    await waitFor(() => {
      expect(useEditorStore.getState().song).not.toBeNull();
    });

    const initialSnap = useEditorStore.getState().snapToGrid;
    fireEvent.press(getByTestId("snap-button"));

    expect(useEditorStore.getState().snapToGrid).toBe(!initialSnap);
  });
});
