import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { loadUserSongs, deleteUserSong } from '../../src/services/songStorage';
import { UserSong } from '../../src/types';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';

export default function UserSongsScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<UserSong[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSongs = useCallback(async () => {
    try {
      const userSongs = await loadUserSongs();
      setSongs(userSongs.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [loadSongs]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  }, [loadSongs]);

  const handleDelete = useCallback(async (songId: string, songTitle: string) => {
    Alert.alert('Delete Song', `Are you sure you want to delete "${songTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUserSong(songId);
            setSongs((prev) => prev.filter((song) => song.id !== songId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete song.');
          }
        },
      },
    ]);
  }, []);

  const renderSongItem = ({ item }: { item: UserSong }) => (
    <Pressable
      style={styles.songCard}
      onPress={() => router.push(`/editor/${item.id}/edit`)}
      onLongPress={() => handleDelete(item.id, item.title)}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <View style={styles.songMeta}>
          <Text style={styles.songMetaText}>{item.bpm} BPM</Text>
          <Text style={styles.songMetaText}>Difficulty {item.difficulty}/5</Text>
          <Text style={styles.songMetaText}>{item.levels[0].chart.length} notes</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Songs Yet</Text>
      <Text style={styles.emptyText}>
        Create your first song to start building your library!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={songs.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <Pressable style={styles.createButton} onPress={() => router.push('/editor/create')}>
        <Text style={styles.createButtonText}>+ Create New Song</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  songCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  songArtist: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  songMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  songMetaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: fontSize.xxl,
  },
  createButton: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
