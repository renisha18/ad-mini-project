import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/storage";

export default function TabLayout() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    void run();
  }, []);

  if (loading) return null;
  if (!currentUser) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: { backgroundColor: "#fff" },
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="compare" options={{ title: "Compare" }} />
      <Tabs.Screen name="friends" options={{ title: "Friends" }} />
    </Tabs>
  );
}
