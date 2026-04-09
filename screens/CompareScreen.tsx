import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LeetCodeStats, fetchUserStats } from "../services/api";

type Props = {
  username: string;
};

function Row({ label, a, b, lowerIsBetter }: { label: string; a: number; b: number; lowerIsBetter?: boolean }) {
  const betterA = lowerIsBetter ? a < b : a > b;
  const betterB = lowerIsBetter ? b < a : b > a;
  return (
    <View style={styles.row}>
      <Text style={[styles.value, betterA && styles.bold]}>{a}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, styles.valueRight, betterB && styles.bold]}>{b}</Text>
    </View>
  );
}

export default function CompareScreen({ username }: Props) {
  const [friendUsername, setFriendUsername] = useState("");
  const [mine, setMine] = useState<LeetCodeStats | null>(null);
  const [friend, setFriend] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!username || !friendUsername.trim()) {
      setError("User not found");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [me, them] = await Promise.all([fetchUserStats(username), fetchUserStats(friendUsername.trim())]);
      setMine(me);
      setFriend(them);
    } catch {
      setError("User not found");
      setMine(null);
      setFriend(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare</Text>
      <Text style={styles.text}>You: {username}</Text>
      <TextInput
        value={friendUsername}
        onChangeText={setFriendUsername}
        placeholder="Friend username"
        style={styles.input}
        autoCapitalize="none"
      />
      <Pressable style={styles.button} onPress={handleCompare}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Compare"}</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}

      {mine && friend ? (
        <View style={styles.card}>
          <Text style={styles.text}>{mine.username} vs {friend.username}</Text>
          <Row label="Total Solved" a={mine.totalSolved} b={friend.totalSolved} />
          <Row label="Easy" a={mine.easySolved} b={friend.easySolved} />
          <Row label="Medium" a={mine.mediumSolved} b={friend.mediumSolved} />
          <Row label="Hard" a={mine.hardSolved} b={friend.hardSolved} />
          <Row label="Ranking" a={mine.ranking} b={friend.ranking} lowerIsBetter />
          <Row label="Acceptance" a={mine.acceptanceRate} b={friend.acceptanceRate} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 10 },
  text: { color: "#000", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#000", color: "#000", padding: 12, marginBottom: 10 },
  button: { borderWidth: 1, borderColor: "#000", padding: 12, alignItems: "center" },
  buttonText: { color: "#000", fontWeight: "700" },
  error: { color: "#000", marginTop: 10, fontWeight: "700" },
  card: { borderWidth: 1, borderColor: "#000", padding: 12, marginTop: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  label: { color: "#000", fontWeight: "700" },
  value: { color: "#000", width: "30%" },
  valueRight: { textAlign: "right" },
  bold: { fontWeight: "900" },
});

