import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chords } from '../../src/constants/chords';
import { ChordDiagram } from '../../src/components/ChordDiagram';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';

export default function ChordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const chord = chords.find((c) => c.id === id);

  if (!chord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chord not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{'<- Back'}</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.chordName}>{chord.primaryName}</Text>
          {chord.alternateNames.length > 0 && (
            <Text style={styles.alternateNames}>
              Also known as: {chord.alternateNames.join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.diagramSection}>
          <ChordDiagram chord={chord} size="large" showName={false} />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{chord.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Difficulty</Text>
            <Text style={styles.infoValue}>{chord.difficulty}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={styles.infoValue}>{chord.notes.join(' - ')}</Text>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <Text style={styles.tipText}>
            - Numbers on dots indicate which finger to use (1=index, 2=middle, 3=ring, 4=pinky)
          </Text>
          <Text style={styles.tipText}>- X means do not play that string</Text>
          <Text style={styles.tipText}>- O means play the string open (no finger)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  chordName: {
    fontSize: fontSize.huge,
    fontWeight: 'bold',
    color: colors.text,
  },
  alternateNames: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  diagramSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.backgroundLight,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  infoSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tipsSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
});
