import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { fetchUserProfile, UserProfile } from "./_utils/api";
import { useSession } from "./_layout";

export default function ProfileScreen() {
  const session = useSession();
  const [username, setUsername] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFetch = async () => {
    const value = username.trim();
    if (!value) {
      setError("User not found");
      setProfile(null);
      return;
    }
    setLoading(true);
    setError("");
    setProfile(null);
    try {
      const data = await fetchUserProfile(value);
      setProfile(data);
      session.setUsername(data.username);
    } catch {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  };

  const loggedIn = session.username ?? profile?.username ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrackYourLeetCodeBuddy</Text>
      <Text style={styles.subtitle}>LeetCode Profile Tracker</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter LeetCode username"
        placeholderTextColor="#555"
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable onPress={handleFetch} style={styles.button}>
        <Text style={styles.buttonText}>Fetch Profile</Text>
      </Pressable>

      {loading ? <Text style={styles.stateText}>Loading...</Text> : null}
      {!loading && error ? <Text style={styles.errorText}>{error}</Text> : null}

      {profile ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{profile.username}</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.totalSolved}</Text>
              <Text style={styles.statLabel}>Solved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{profile.ranking}</Text>
              <Text style={styles.statLabel}>Ranking</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.row}>
        <Link
          href="/compare"
          style={styles.linkButton}
        >
          ⚔️  Compare
        </Link>
        <Link
          href="/friends"
          style={styles.linkButton}
        >
          👥  Friends
        </Link>
      </View>

      {!loggedIn ? (
        <Text style={styles.helperText}>
          Fetch your profile once to continue as the same user.
        </Text>
      ) : (
        <Text style={styles.helperText}>Logged in as {loggedIn}</Text>
      )}
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
    letterSpacing: 0.5,
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
  cardHeader: {
    backgroundColor: "#FFA116",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cardHeaderText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 16,
  },
  statRow: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#FFA116",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#333",
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  helperText: {
    color: "#555",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  linkButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFA116",
    color: "#FFA116",
    backgroundColor: "transparent",
    paddingVertical: 11,
    paddingHorizontal: 16,
    fontWeight: "700",
    overflow: "hidden",
    borderRadius: 6,
    textAlign: "center",
    fontSize: 14,
  },
});