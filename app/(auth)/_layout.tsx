import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { color: "#000" }, headerTintColor: "#000" }}>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="signup" options={{ title: "Signup" }} />
    </Stack>
  );
}

