import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { chords } from '../../src/constants/chords';
import { ChordDiagram } from '../../src/components/ChordDiagram';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';
import { Chord } from '../../src/types';

type FilterType = 'all' | 'major' | 'minor' | '7th';

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredChords = useMemo(() => {
    return chords.filter((chord) => {
      const matchesSearch =
        searchQuery === '' ||
        chord.primaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chord.alternateNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = filter === 'all' || chord.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filter]);

  const renderChordItem = ({ item }: { item: Chord }) => (
    <Pressable
      style={({ pressed }) => [styles.chordCard, pressed && styles.chordCardPressed]}
      onPress={() => router.push(`/chord/${item.id}`)}
    >
      <ChordDiagram chord={item} size="small" />
      <View style={styles.chordInfo}>
        <Text style={styles.chordType}>{item.type}</Text>
        <Text style={styles.chordDifficulty}>{item.difficulty}</Text>
      </View>
    </Pressable>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'major', label: 'Major' },
    { key: 'minor', label: 'Minor' },
    { key: '7th', label: '7th' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chord Library</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chords..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredChords}
        renderItem={renderChordItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chords found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundLight,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  filterTextActive: {
    color: colors.backgroundDark,
    fontWeight: 'bold',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-between',
  },
  chordCard: {
    width: '48%',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  chordCardPressed: {
    opacity: 0.7,
  },
  chordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.sm,
  },
  chordType: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  chordDifficulty: {
    color: colors.primary,
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
