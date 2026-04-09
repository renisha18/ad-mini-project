import { useCallback, useState } from "react";
import { Redirect, useFocusEffect } from "expo-router";
import CompareScreen from "../../screens/CompareScreen";
import { getCurrentUser } from "../../services/storage";

export default function CompareRoute() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = async () => {
        const user = await getCurrentUser();
        if (!active) return;
        setUsername(user);
        setLoading(false);
      };
      void run();
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) return null;
  if (!username) return <Redirect href="/(auth)/login" />;
  return <CompareScreen username={username} />;
}

