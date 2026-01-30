import { Text, StyleSheet, View } from 'react-native';
import { HitType } from '../types';
import { colors, fontSize } from '../constants/theme';

const feedbackColors: Record<HitType, string> = {
  perfect: colors.perfect,
  good: colors.good,
  miss: colors.miss,
};

export const HitFeedback = ({ type }: { type: HitType }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: feedbackColors[type] }]}>
        {type.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '60%',
    alignSelf: 'center',
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
});
