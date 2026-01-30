import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";
import { chords } from "../../constants/chords";

interface ChordPaletteProps {
  selectedChord: string | null;
  onSelectChord: (chord: string) => void;
}

// Common chords shown at top for quick access
const QUICK_ACCESS_CHORDS = [
  "G",
  "C",
  "D",
  "Em",
  "Am",
  "E",
  "A",
  "F",
  "Dm",
  "Bm",
];

export const ChordPalette: React.FC<ChordPaletteProps> = ({
  selectedChord,
  onSelectChord,
}) => {
  const [search, setSearch] = useState("");

  const filteredChords = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.toLowerCase();
    return chords
      .filter(
        (chord) =>
          chord.primaryName.toLowerCase().includes(query) ||
          chord.alternateNames.some((name) =>
            name.toLowerCase().includes(query),
          ),
      )
      .slice(0, 12);
  }, [search]);

  const renderChordButton = (chordName: string) => {
    const isSelected = selectedChord === chordName;

    return (
      <Pressable
        key={chordName}
        testID={`chord-button-${chordName}`}
        style={[styles.chordButton, isSelected && styles.chordButtonSelected]}
        onPress={() => onSelectChord(chordName)}
      >
        <Text
          style={[styles.chordText, isSelected && styles.chordTextSelected]}
        >
          {chordName}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search chords..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Quick access chords */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickAccessScroll}
        contentContainerStyle={styles.quickAccessContent}
      >
        {QUICK_ACCESS_CHORDS.map(renderChordButton)}
      </ScrollView>

      {/* Search results */}
      {filteredChords.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <View style={styles.chordGrid}>
            {filteredChords.map((chord) =>
              renderChordButton(chord.primaryName),
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.textMuted,
  },
  searchInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  quickAccessScroll: {
    marginBottom: spacing.sm,
  },
  quickAccessContent: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  chordButton: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 48,
    alignItems: "center",
  },
  chordButtonSelected: {
    backgroundColor: colors.primary,
  },
  chordText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  chordTextSelected: {
    color: colors.backgroundDark,
  },
  searchResults: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  chordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
