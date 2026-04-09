import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchCalendar, fetchUserStats, getTodayKey } from "../services/api";
import {
  addFriendToCurrentUser, getCurrentUserData,
  removeFriendFromCurrentUser, updateFriendStreak,
} from "../services/storage";
import { T } from "../constants/theme";
import AppInput from "../components/ui/AppInput";
import AppButton from "../components/ui/AppButton";
import Card from "../components/ui/Card";

type Props = { username: string };

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
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const user = await getCurrentUserData();
      if (!user) return;
      const myCalendar = await fetchCalendar(username);
      const todayKey = getTodayKey();
      const next: FriendView[] = [];

      for (const fu of user.friends) {
        try {
          const [stats, cal] = await Promise.all([fetchUserStats(fu), fetchCalendar(fu)]);
          const activeToday = (cal[todayKey] ?? 0) > 0;
          const bothActive = activeToday && (myCalendar[todayKey] ?? 0) > 0;
          const prev = user.streaks[fu] ?? 0;
          const lastDate = user.lastActive[fu] ?? "";
          const streak = bothActive && lastDate !== todayKey ? prev + 1 : bothActive ? prev : 0;
          await updateFriendStreak(fu, streak, bothActive ? todayKey : "");
          next.push({ username: fu, totalSolved: stats.totalSolved, ranking: stats.ranking, streak, activeToday });
        } catch {
          next.push({ username: fu, totalSolved: 0, ranking: 0, streak: user.streaks[fu] ?? 0, activeToday: false });
        }
      }
      setFriends(next);
    } catch {
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const handleAdd = async () => {
    setError("");
    setAddLoading(true);
    try {
      const result = await addFriendToCurrentUser(friendInput);
      if (!result.ok) { setError(result.message ?? "Could not add friend"); return; }
      setFriendInput("");
      await refresh();
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (fu: string) => {
    await removeFriendFromCurrentUser(fu);
    setFriends((prev) => prev.filter((f) => f.username !== fu));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>Track your friends' progress</Text>

      {/* Add friend */}
      <View style={styles.addRow}>
        <AppInput
          value={friendInput}
          onChangeText={setFriendInput}
          placeholder="Add by username"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.addInput}
        />
        <AppButton label="Add" loading={addLoading} onPress={handleAdd} style={styles.addBtn} />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {loading && friends.length === 0 && (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      )}

      {!loading && friends.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No friends added yet</Text>
          <Text style={styles.emptySubtext}>Add a friend by their LeetCode username</Text>
        </View>
      )}

      {friends.map((f) => (
        <Card key={f.username} style={styles.friendCard}>
          <View style={styles.friendHeader}>
            <View style={styles.friendLeft}>
              <View style={[styles.activeDot, { backgroundColor: f.activeToday ? T.easy : T.border }]} />
              <Text style={styles.friendName}>{f.username}</Text>
            </View>
            <TouchableOpacity onPress={() => void handleRemove(f.username)} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.friendStats}>
            <View style={styles.friendStat}>
              <Text style={styles.friendStatVal}>{f.totalSolved}</Text>
              <Text style={styles.friendStatLabel}>Solved</Text>
            </View>
            <View style={styles.friendStat}>
              <Text style={styles.friendStatVal}>#{f.ranking > 0 ? f.ranking.toLocaleString() : "—"}</Text>
              <Text style={styles.friendStatLabel}>Rank</Text>
            </View>
            <View style={styles.friendStat}>
              <Text style={[styles.friendStatVal, { color: f.streak > 0 ? T.medium : T.textSecondary }]}>
                {f.streak > 0 ? `🔥 ${f.streak}` : "—"}
              </Text>
              <Text style={styles.friendStatLabel}>Streak</Text>
            </View>
          </View>
        </Card>
      ))}

      {friends.length > 0 && (
        <TouchableOpacity onPress={() => void refresh()} style={styles.refreshBtn} disabled={loading}>
          {loading
            ? <ActivityIndicator color={T.accent} size="small" />
            : <Text style={styles.refreshText}>↻  Refresh</Text>}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  container: { padding: T.padding, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", color: T.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: T.textSecondary, marginBottom: 20 },
  addRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  addInput: { flex: 1, marginBottom: 0 },
  addBtn: { width: 80, marginBottom: 0 },
  error: { color: T.hard, fontSize: 13, marginTop: 8, marginBottom: 4 },
  center: { alignItems: "center", marginVertical: 40 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", color: T.textSecondary },
  emptySubtext: { fontSize: 13, color: T.textSecondary, marginTop: 6, opacity: 0.7 },
  friendCard: { marginTop: 4 },
  friendHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  friendLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  friendName: { fontSize: 15, fontWeight: "700", color: T.textPrimary },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: T.hard },
  removeText: { color: T.hard, fontSize: 12, fontWeight: "600" },
  friendStats: { flexDirection: "row", justifyContent: "space-around" },
  friendStat: { alignItems: "center" },
  friendStatVal: { fontSize: 18, fontWeight: "700", color: T.textPrimary },
  friendStatLabel: { fontSize: 11, color: T.textSecondary, marginTop: 2 },
  refreshBtn: { alignItems: "center", marginTop: 12, paddingVertical: 10 },
  refreshText: { color: T.accent, fontSize: 14, fontWeight: "600" },
});
