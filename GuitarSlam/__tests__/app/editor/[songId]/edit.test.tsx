import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import EditSongScreen from "../../../../app/editor/[songId]/edit";
import { useEditorStore } from "../../../../src/stores/useEditorStore";
import { getUserSong } from "../../../../src/services/songStorage";
import { UserSong } from "../../../../src/types";

// Mock expo-router
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ songId: "test-song-123" }),
}));

// Mock songStorage
jest.mock("../../../../src/services/songStorage", () => ({
  getUserSong: jest.fn(),
  saveUserSong: jest.fn().mockResolvedValue(undefined),
}));

const mockSong: UserSong = {
  id: "test-song-123",
  title: "Test Song",
  artist: "Test Artist",
  bpm: 120,
  difficulty: 2,
  levels: [
    {
      levelNumber: 1,
      name: "Full Song",
      description: "Complete song chart",
      chart: [{ id: "note-1", chord: "G", time: 0, duration: 2 }],
    },
  ],
  isUserCreated: true,
  createdAt: 1234567890,
  updatedAt: 1234567890,
};

describe("EditSongScreen", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    jest.clearAllMocks();
  });

  it("shows loading indicator initially", () => {
    (getUserSong as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId } = render(<EditSongScreen />);
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("loads and displays existing song", async () => {
    (getUserSong as jest.Mock).mockResolvedValue(mockSong);

    const { getByPlaceholderText, getByText } = render(<EditSongScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Song title")).toBeTruthy();
    });

    // Song data should be loaded into the store
    expect(useEditorStore.getState().song?.title).toBe("Test Song");
    expect(getByText("120")).toBeTruthy(); // BPM
  });

  it("shows error when song not found", async () => {
    (getUserSong as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<EditSongScreen />);

    await waitFor(() => {
      expect(getByTestId("error-text")).toBeTruthy();
    });

    expect(getByTestId("error-text").props.children).toBe("Song not found");
  });

  it("shows error on load failure", async () => {
    (getUserSong as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { getByTestId } = render(<EditSongScreen />);

    await waitFor(() => {
      expect(getByTestId("error-text")).toBeTruthy();
    });

    expect(getByTestId("error-text").props.children).toBe("Failed to load song");
  });

  it("renders editor components after loading", async () => {
    (getUserSong as jest.Mock).mockResolvedValue(mockSong);

    const { getByTestId } = render(<EditSongScreen />);

    await waitFor(() => {
      expect(getByTestId("undo-button")).toBeTruthy();
    });

    expect(getByTestId("save-button")).toBeTruthy();
    expect(getByTestId("timeline-grid")).toBeTruthy();
  });

  it("displays existing notes from loaded song", async () => {
    (getUserSong as jest.Mock).mockResolvedValue(mockSong);

    const { getByTestId } = render(<EditSongScreen />);

    await waitFor(() => {
      expect(getByTestId("chord-note-block")).toBeTruthy();
    });
  });
});
