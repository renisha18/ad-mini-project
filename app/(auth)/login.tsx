import { router } from "expo-router";
import LoginScreen from "../../screens/LoginScreen";

export default function LoginRoute() {
  return (
    <LoginScreen
      onSuccess={() => router.replace("/(tabs)")}
      onGoSignup={() => router.push("/(auth)/signup")}
    />
  );
}

