import { router } from "expo-router";
import SignupScreen from "../../screens/SignupScreen";

export default function SignupRoute() {
  return (
    <SignupScreen
      onSuccess={() => router.replace("/(tabs)")}
      onGoLogin={() => router.back()}
    />
  );
}

