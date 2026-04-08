import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { fetchUserProfile, UserProfile } from "./_utils/api";
import { useSession } from "./_layout";

function StatRow(props: {
  label: string;
  left: number;
  right: number;
  lowerIsBetter?: boolean;
}) {
  const lowerIsBetter = props.lowerIsBetter ?? false;
  const leftBetter = lowerIsBetter ? props.left < props.right : props.left > props.right;
  const rightBetter = lowerIsBetter ? props.right < props.left : props.right > props.left;

  return (
    <View style={styles.statRow}>
      <Text style={[styles.statValue, leftBetter && styles.winner]}>{props.left}</Text>
      <Text style={styles.statLabel}>{props.label}</Text>
      <Text style={[styles.statValue, styles.statValueRight, rightBetter && styles.winner]}>
        {props.right}
      </Text>
    </View>
  );
}

export default function CompareScreen() {
  const session = useSession();
  const [friendUsername, setFriendUsername] = useState<string>("");
  const [leftUser, setLeftUser] = useState<UserProfile | null>(null);
  const [rightUser, setRightUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleCompare = async () => {
    const me = (session.username ?? "").trim();
    const friend = friendUsername.trim();
    if (!me || !friend) {
      setError("User not found");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [meData, friendData] = await Promise.all([
        fetchUserProfile(me),
        fetchUserProfile(friend),
      ]);
      setLeftUser(meData);
      setRightUser(friendData);
    } catch {
      setLeftUser(null);
      setRightUser(null);
      setError("User not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare</Text>
      <Text style={styles.subtitle}>Head to Head Stats</Text>

      {!session.username ? (
        <View style={styles.card}>
          <Text style={styles.stateText}>Loading...</Text>
          <Text style={styles.helperText}>Go back and fetch your profile once.</Text>
        </View>
      ) : (
        <Text style={styles.meText}>You: {session.username}</Text>
      )}
      <TextInput
        value={friendUsername}
        onChangeText={setFriendUsername}
        placeholder="Friend's username"
        placeholderTextColor="#555"
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable onPress={handleCompare} style={styles.button}>
        <Text style={styles.buttonText}>⚔️  Compare</Text>
      </Pressable>

      <Link href="/" style={styles.linkButton}>
        ← Back
      </Link>

      {loading ? <Text style={styles.stateText}>Loading...</Text> : null}
      {!loading && error ? <Text style={styles.errorText}>{error}</Text> : null}

      {leftUser && rightUser ? (
        <View style={styles.card}>
          <View style={styles.headRow}>
            <Text style={styles.headText}>{leftUser.username}</Text>
            <Text style={styles.vsText}>VS</Text>
            <Text style={[styles.headText, styles.headTextRight]}>{rightUser.username}</Text>
          </View>
          <View style={styles.divider} />
          <StatRow label="Total Solved" left={leftUser.totalSolved} right={rightUser.totalSolved} />
          <StatRow label="Ranking" left={leftUser.ranking} right={rightUser.ranking} lowerIsBetter />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  title: {
    color: "#FFA116",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#555",
    fontSize: 13,
    marginBottom: 24,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    color: "#FFF",
    backgroundColor: "#262626",
    padding: 13,
    marginBottom: 10,
    borderRadius: 6,
    fontSize: 15,
  },
  meText: {
    color: "#888",
    marginBottom: 10,
    fontWeight: "700",
  },
  helperText: {
    color: "#555",
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FFA116",
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 6,
    marginBottom: 4,
  },
  buttonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 15,
  },
  linkButton: {
    borderWidth: 1,
    borderColor: "#333",
    color: "#888",
    backgroundColor: "transparent",
    paddingVertical: 11,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "700",
    overflow: "hidden",
    borderRadius: 6,
    fontSize: 14,
  },
  stateText: {
    color: "#FFA116",
    marginTop: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  errorText: {
    color: "#EF4743",
    marginTop: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#262626",
    borderRadius: 8,
    overflow: "hidden",
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headText: {
    color: "#FFA116",
    fontWeight: "800",
    fontSize: 14,
    width: "38%",
  },
  headTextRight: {
    textAlign: "right",
  },
  vsText: {
    color: "#555",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
  },
  statValue: {
    color: "#AAA",
    width: "30%",
    fontSize: 15,
    fontWeight: "600",
  },
  statValueRight: {
    textAlign: "right",
  },
  statLabel: {
    color: "#666",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  winner: {
    color: "#FFA116",
    fontWeight: "800",
    fontSize: 16,
  },
});