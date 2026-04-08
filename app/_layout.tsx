import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import React, { createContext, useContext, useMemo, useState } from "react";

type Session = {
  username: string | null;
  setUsername: (username: string | null) => void;
};

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionContext provider");
  return ctx;
}

const LeetCodeTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#FFA116",
    background: "#1A1A1A",
    card: "#1F1F1F",
    text: "#FFFFFF",
    border: "#333333",
    notification: "#FFA116",
  },
};

export default function RootLayout() {
  const [username, setUsername] = useState<string | null>(null);

  const session = useMemo<Session>(() => {
    return {
      username,
      setUsername: (value) => setUsername(value && value.trim() ? value.trim() : null),
    };
  }, [username]);

  return (
    <ThemeProvider value={LeetCodeTheme}>
      <SessionContext.Provider value={session}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#1F1F1F" },
            headerTintColor: "#FFA116",
            headerTitleStyle: { fontWeight: "800" },
          }}
        >
          <Stack.Screen name="index" options={{ title: "TrackYourLeetCodeBuddy" }} />
          <Stack.Screen name="compare" options={{ title: "Compare" }} />
          <Stack.Screen name="friends" options={{ title: "Friends" }} />
        </Stack>
        <StatusBar style="light" />
      </SessionContext.Provider>
    </ThemeProvider>
  );
}