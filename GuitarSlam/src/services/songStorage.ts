import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSong } from "../types";

const STORAGE_KEY = "user_songs";

export async function saveUserSong(song: UserSong): Promise<void> {
  const songs = await getAllUserSongs();
  const existingIndex = songs.findIndex((s) => s.id === song.id);

  if (existingIndex >= 0) {
    songs[existingIndex] = { ...song, updatedAt: Date.now() };
  } else {
    songs.push(song);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export async function getUserSong(songId: string): Promise<UserSong | null> {
  const songs = await getAllUserSongs();
  return songs.find((s) => s.id === songId) ?? null;
}

export async function getAllUserSongs(): Promise<UserSong[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data) as UserSong[];
}

export async function deleteUserSong(songId: string): Promise<void> {
  const songs = await getAllUserSongs();
  const filtered = songs.filter((s) => s.id !== songId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
