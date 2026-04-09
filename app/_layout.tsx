import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { T } from "../constants/theme";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: T.card },
        headerTitleStyle: { color: T.textPrimary },
        headerTintColor: T.accent,
        contentStyle: { backgroundColor: T.bg },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}