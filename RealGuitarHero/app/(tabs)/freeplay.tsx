import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockAudioDetection } from '../../src/hooks/useMockAudioDetection';
import { colors, spacing, fontSize } from '../../src/constants/theme';

export default function FreeplayScreen() {
  const { isListening, currentChord, chordHistory, start, stop } = useMockAudioDetection();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Freeplay Mode</Text>
        <Text style={styles.subtitle}>Play any chord and see instant feedback</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Detected Chord</Text>
        <Text style={styles.chordName}>{currentChord?.name ?? '—'}</Text>
        <Text style={styles.confidence}>
          Confidence: {currentChord ? `${Math.round(currentChord.confidence * 100)}%` : '—'}
        </Text>
      </View>

      <Pressable
        onPress={isListening ? stop : start}
        style={[styles.button, isListening ? styles.buttonStop : styles.buttonStart]}
      >
        <Text style={styles.buttonText}>{isListening ? 'Stop Listening' : 'Start Listening'}</Text>
      </Pressable>

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Recent</Text>
        <FlatList
          data={chordHistory}
          keyExtractor={(item) => `${item.timestamp}`}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyChord}>{item.name}</Text>
              <Text style={styles.historyNotes}>{item.notes.join('-')}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  chordName: {
    color: colors.text,
    fontSize: fontSize.huge,
    fontWeight: '800',
    marginVertical: spacing.sm,
  },
  confidence: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonStart: {
    backgroundColor: colors.primary,
  },
  buttonStop: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
  },
  history: {
    flex: 1,
  },
  historyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  historyItem: {
    paddingVertical: spacing.sm,
    borderBottomColor: colors.backgroundLight,
    borderBottomWidth: 1,
  },
  historyChord: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  historyNotes: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
