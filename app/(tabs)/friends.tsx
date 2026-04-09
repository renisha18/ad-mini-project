import { useCallback, useState } from "react";
import { Redirect, useFocusEffect } from "expo-router";
import FriendsScreen from "../../screens/FriendsScreen";
import { getCurrentUser } from "../../services/storage";

export default function FriendsRoute() {
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
  return <FriendsScreen username={username} />;
}

