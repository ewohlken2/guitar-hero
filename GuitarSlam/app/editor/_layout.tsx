import { Stack } from "expo-router";
import { colors } from "../../src/constants/theme";

export default function EditorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundDark },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: "Create Song",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[songId]/edit"
        options={{
          title: "Edit Song",
        }}
      />
      <Stack.Screen
        name="[songId]/preview"
        options={{
          title: "Preview",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
