import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LeetCodeStats, fetchUserStats } from "../services/api";
import { logoutUser } from "../services/storage";
import { useFocusEffect } from "expo-router";

type Props = {
  username: string;
  onLoggedOut: () => void;
};

export default function HomeScreen({ username, onLoggedOut }: Props) {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchUserStats(username);
      setStats(data);
    } catch {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleLogout = async () => {
    await logoutUser();
    onLoggedOut();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.text}>Logged in as: {username}</Text>
      <Pressable style={styles.button} onPress={load}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Refresh Stats"}</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {stats ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LeetCode Stats</Text>
          <Text style={styles.text}>Total Solved: {stats.totalSolved}</Text>
          <Text style={styles.text}>Easy: {stats.easySolved}</Text>
          <Text style={styles.text}>Medium: {stats.mediumSolved}</Text>
          <Text style={styles.text}>Hard: {stats.hardSolved}</Text>
          <Text style={styles.text}>Ranking: {stats.ranking}</Text>
          <Text style={styles.text}>Acceptance Rate: {stats.acceptanceRate}%</Text>
          <Text style={styles.text}>Submission Stats: {stats.totalSubmissions}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", minHeight: "100%" },
  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 12 },
  card: { borderWidth: 1, borderColor: "#000", padding: 12, marginTop: 14 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 6 },
  text: { color: "#000", marginBottom: 4 },
  button: { borderWidth: 1, borderColor: "#000", padding: 12, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#000", fontWeight: "700" },
  error: { color: "#000", marginTop: 10, fontWeight: "700" },
});

