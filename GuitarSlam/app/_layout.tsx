import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='editor' options={{ headerShown: false }} />
        <Stack.Screen name='songs' options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
