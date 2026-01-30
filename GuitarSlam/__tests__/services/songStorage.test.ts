import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveUserSong,
  getUserSong,
  getAllUserSongs,
  deleteUserSong,
} from "../../src/services/songStorage";
import { UserSong } from "../../src/types";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockSong: UserSong = {
  id: "song-123",
  title: "Test Song",
  artist: "Test Artist",
  bpm: 120,
  difficulty: 2,
  levels: [{ levelNumber: 1, name: "Full", description: "Full song", chart: [] }],
  isUserCreated: true,
  createdAt: 1234567890,
  updatedAt: 1234567890,
};

describe("songStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves a user song", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await saveUserSong(mockSong);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "user_songs",
      expect.stringContaining(mockSong.id)
    );
  });

  it("retrieves a user song by id", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockSong]));

    const result = await getUserSong("song-123");

    expect(result?.id).toBe("song-123");
  });

  it("returns null for non-existent song", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

    const result = await getUserSong("non-existent");

    expect(result).toBeNull();
  });

  it("retrieves all user songs", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockSong]));

    const result = await getAllUserSongs();

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("song-123");
  });

  it("deletes a user song", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockSong]));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await deleteUserSong("song-123");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("user_songs", "[]");
  });
});
