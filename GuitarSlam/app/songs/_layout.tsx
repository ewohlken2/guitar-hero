import { Stack } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function SongsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundDark },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'My Songs',
        }}
      />
    </Stack>
  );
}
