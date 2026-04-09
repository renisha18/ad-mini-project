import { useCallback, useState } from "react";
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { LeetCodeStats, fetchUserStats } from "../services/api";
import { logoutUser } from "../services/storage";
import { T } from "../constants/theme";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

// LeetCode approximate totals for progress bars
const TOTAL_EASY = 850;
const TOTAL_MEDIUM = 1800;
const TOTAL_HARD = 800;

type Props = { username: string; onLoggedOut: () => void };

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </Card>
  );
}

export default function HomeScreen({ username, onLoggedOut }: Props) {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await fetchUserStats(username));
    } catch {
      setError("Could not load stats. Check your username.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleLogout = async () => { await logoutUser(); onLoggedOut(); };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hi, {username} 👋</Text>
          <Text style={styles.subGreeting}>Here's your progress</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading && !stats && (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      {stats && (
        <>
          {/* Top stats grid */}
          <View style={styles.grid}>
            <StatCard label="Total Solved" value={stats.totalSolved} color={T.accent} />
            <StatCard label="Ranking" value={`#${stats.ranking.toLocaleString()}`} />
          </View>
          <View style={styles.grid}>
            <StatCard label="Acceptance" value={`${stats.acceptanceRate}%`} />
            <StatCard label="Submissions" value={stats.totalSubmissions} />
          </View>

          {/* Difficulty breakdown */}
          <Card>
            <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
            <View style={styles.diffRow}>
              <View style={styles.diffItem}>
                <Text style={[styles.diffValue, { color: T.easy }]}>{stats.easySolved}</Text>
                <Text style={styles.diffLabel}>Easy</Text>
              </View>
              <View style={styles.diffDivider} />
              <View style={styles.diffItem}>
                <Text style={[styles.diffValue, { color: T.medium }]}>{stats.mediumSolved}</Text>
                <Text style={styles.diffLabel}>Medium</Text>
              </View>
              <View style={styles.diffDivider} />
              <View style={styles.diffItem}>
                <Text style={[styles.diffValue, { color: T.hard }]}>{stats.hardSolved}</Text>
                <Text style={styles.diffLabel}>Hard</Text>
              </View>
            </View>
          </Card>

          {/* Progress bars */}
          <Card>
            <Text style={styles.sectionTitle}>Progress</Text>
            <ProgressBar label="Easy" solved={stats.easySolved} total={TOTAL_EASY} color={T.easy} />
            <ProgressBar label="Medium" solved={stats.mediumSolved} total={TOTAL_MEDIUM} color={T.medium} />
            <ProgressBar label="Hard" solved={stats.hardSolved} total={TOTAL_HARD} color={T.hard} />
          </Card>
        </>
      )}

      <TouchableOpacity onPress={load} style={styles.refreshBtn} disabled={loading}>
        {loading
          ? <ActivityIndicator color={T.accent} size="small" />
          : <Text style={styles.refreshText}>↻  Refresh</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  container: { padding: T.padding, paddingBottom: 32 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "700", color: T.textPrimary },
  subGreeting: { fontSize: 13, color: T.textSecondary, marginTop: 2 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: T.border },
  logoutText: { color: T.textSecondary, fontSize: 13 },
  center: { alignItems: "center", marginVertical: 40 },
  error: { color: T.hard, fontSize: 13, marginBottom: 12 },
  grid: { flexDirection: "row", gap: 10, marginBottom: 0 },
  statCard: { flex: 1 },
  statLabel: { fontSize: 12, color: T.textSecondary, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "700", color: T.textPrimary },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: T.textSecondary, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  diffRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  diffItem: { alignItems: "center", flex: 1 },
  diffValue: { fontSize: 26, fontWeight: "700" },
  diffLabel: { fontSize: 12, color: T.textSecondary, marginTop: 4 },
  diffDivider: { width: 1, height: 40, backgroundColor: T.border },
  refreshBtn: { alignItems: "center", marginTop: 8, paddingVertical: 10 },
  refreshText: { color: T.accent, fontSize: 14, fontWeight: "600" },
});
