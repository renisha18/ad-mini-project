import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { fetchCalendar, fetchUserStats, getTodayKey } from "../services/api";
import {
  addFriendToCurrentUser,
  getCurrentUserData,
  removeFriendFromCurrentUser,
  updateFriendStreak,
} from "../services/storage";
import { useFocusEffect } from "expo-router";

type Props = {
  username: string;
};

type FriendView = {
  username: string;
  totalSolved: number;
  ranking: number;
  streak: number;
  activeToday: boolean;
};

export default function FriendsScreen({ username }: Props) {
  const [friendInput, setFriendInput] = useState("");
  const [friends, setFriends] = useState<FriendView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const user = await getCurrentUserData();
      if (!user) return;
      const myCalendar = await fetchCalendar(username);
      const todayKey = getTodayKey();
      const next: FriendView[] = [];

      for (const friendUsername of user.friends) {
        try {
          const [stats, friendCalendar] = await Promise.all([
            fetchUserStats(friendUsername),
            fetchCalendar(friendUsername),
          ]);

          const activeToday = (friendCalendar[todayKey] ?? 0) > 0;
          const bothActiveToday = activeToday && (myCalendar[todayKey] ?? 0) > 0;
          const lastDate = user.lastActive[friendUsername] ?? "";
          const previous = user.streaks[friendUsername] ?? 0;
          let streak = previous;

          if (bothActiveToday && lastDate !== todayKey) {
            streak = previous + 1;
          } else if (!bothActiveToday) {
            streak = 0;
          }

          await updateFriendStreak(friendUsername, streak, bothActiveToday ? todayKey : "");

          next.push({
            username: friendUsername,
            totalSolved: stats.totalSolved,
            ranking: stats.ranking,
            streak,
            activeToday,
          });
        } catch {
          next.push({
            username: friendUsername,
            totalSolved: 0,
            ranking: 0,
            streak: user.streaks[friendUsername] ?? 0,
            activeToday: false,
          });
        }
      }

      setFriends(next);
    } catch {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const handleAdd = async () => {
    setError("");
    const result = await addFriendToCurrentUser(friendInput);
    if (!result.ok) {
      setError(result.message ?? "User not found");
      return;
    }
    setFriendInput("");
    await refresh();
  };

  const handleRemove = async (friendUsername: string) => {
    await removeFriendFromCurrentUser(friendUsername);
    await refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.text}>Logged in as: {username}</Text>

      <TextInput
        value={friendInput}
        onChangeText={setFriendInput}
        placeholder="Add friend username"
        style={styles.input}
        autoCapitalize="none"
      />
      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Friend</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void refresh()}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Refresh"}</Text>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {friends.map((friend) => (
        <View key={friend.username} style={styles.card}>
          <Text style={styles.cardTitle}>{friend.username}</Text>
          <Text style={styles.text}>Total Solved: {friend.totalSolved}</Text>
          <Text style={styles.text}>Ranking: {friend.ranking}</Text>
          <Text style={styles.text}>Streak: {friend.streak}</Text>
          <Text style={styles.text}>{friend.activeToday ? "Active Today" : "Not Active Today"}</Text>
          <Pressable style={styles.removeButton} onPress={() => void handleRemove(friend.username)}>
            <Text style={styles.buttonText}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", minHeight: "100%" },
  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 10 },
  text: { color: "#000", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#000", color: "#000", padding: 12, marginBottom: 10 },
  button: { borderWidth: 1, borderColor: "#000", padding: 12, alignItems: "center", marginTop: 4 },
  removeButton: { borderWidth: 1, borderColor: "#000", padding: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#000", fontWeight: "700" },
  card: { borderWidth: 1, borderColor: "#000", padding: 12, marginTop: 12 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 6 },
  error: { color: "#000", marginTop: 10, fontWeight: "700" },
});

