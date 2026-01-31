import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize } from '../../src/constants/theme';

const cards = [
  { title: 'Freeplay', description: 'Practice chords with real-time feedback', route: '/(tabs)/freeplay' },
  { title: 'Game Mode', description: 'Play along with falling notes', route: '/(tabs)/game' },
  { title: 'Library', description: 'Browse chord diagrams', route: '/(tabs)/library' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Real Guitar Hero</Text>
        <Text style={styles.subtitle}>Pick a mode to start practicing</Text>
      </View>

      {cards.map((card) => (
        <Pressable key={card.title} style={styles.card} onPress={() => router.push(card.route)}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>
        </Pressable>
      ))}
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
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.lg,
  },
  cardDescription: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
