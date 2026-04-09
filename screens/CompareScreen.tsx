import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { LeetCodeStats, fetchUserStats } from "../services/api";
import { T } from "../constants/theme";
import AppInput from "../components/ui/AppInput";
import AppButton from "../components/ui/AppButton";
import Card from "../components/ui/Card";

type Props = { username: string };

type StatRowProps = {
  label: string;
  a: number | string;
  b: number | string;
  aWins?: boolean;
  bWins?: boolean;
};

function StatRow({ label, a, b, aWins, bWins }: StatRowProps) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.rowVal, aWins && styles.winVal]}>{a}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowVal, styles.rowValRight, bWins && styles.winVal]}>{b}</Text>
    </View>
  );
}

function UserCard({ stats, highlight }: { stats: LeetCodeStats; highlight?: boolean }) {
  return (
    <Card style={[styles.userCard, highlight && styles.userCardHighlight]}>
      <Text style={styles.cardUsername}>{stats.username}</Text>
      <Text style={styles.cardTotal}>{stats.totalSolved}</Text>
      <Text style={styles.cardTotalLabel}>solved</Text>
      <Text style={styles.cardRank}>#{stats.ranking.toLocaleString()}</Text>
    </Card>
  );
}

export default function CompareScreen({ username }: Props) {
  const [friendUsername, setFriendUsername] = useState("");
  const [mine, setMine] = useState<LeetCodeStats | null>(null);
  const [friend, setFriend] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!friendUsername.trim()) { setError("Enter a username to compare"); return; }
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Compare</Text>
      <Text style={styles.subtitle}>You vs anyone on LeetCode</Text>

      <AppInput
        value={friendUsername}
        onChangeText={setFriendUsername}
        placeholder="Enter username to compare"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AppButton label="Compare" loading={loading} onPress={handleCompare} />

      {!!error && <Text style={styles.error}>{error}</Text>}

      {loading && !mine && (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      )}

      {mine && friend && (
        <>
          {/* User cards side by side */}
          <View style={styles.cardsRow}>
            <UserCard stats={mine} highlight={mine.totalSolved >= friend.totalSolved} />
            <View style={styles.vsWrap}><Text style={styles.vs}>VS</Text></View>
            <UserCard stats={friend} highlight={friend.totalSolved > mine.totalSolved} />
          </View>

          {/* Detailed comparison */}
          <Card>
            <Text style={styles.sectionTitle}>Head to Head</Text>
            <StatRow
              label="Total"
              a={mine.totalSolved} b={friend.totalSolved}
              aWins={mine.totalSolved > friend.totalSolved}
              bWins={friend.totalSolved > mine.totalSolved}
            />
            <StatRow
              label="Easy"
              a={mine.easySolved} b={friend.easySolved}
              aWins={mine.easySolved > friend.easySolved}
              bWins={friend.easySolved > mine.easySolved}
            />
            <StatRow
              label="Medium"
              a={mine.mediumSolved} b={friend.mediumSolved}
              aWins={mine.mediumSolved > friend.mediumSolved}
              bWins={friend.mediumSolved > mine.mediumSolved}
            />
            <StatRow
              label="Hard"
              a={mine.hardSolved} b={friend.hardSolved}
              aWins={mine.hardSolved > friend.hardSolved}
              bWins={friend.hardSolved > mine.hardSolved}
            />
            <StatRow
              label="Rank"
              a={`#${mine.ranking.toLocaleString()}`}
              b={`#${friend.ranking.toLocaleString()}`}
              aWins={mine.ranking < friend.ranking && mine.ranking > 0}
              bWins={friend.ranking < mine.ranking && friend.ranking > 0}
            />
            <StatRow
              label="Accept %"
              a={`${mine.acceptanceRate}%`}
              b={`${friend.acceptanceRate}%`}
              aWins={mine.acceptanceRate > friend.acceptanceRate}
              bWins={friend.acceptanceRate > mine.acceptanceRate}
            />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  container: { padding: T.padding, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", color: T.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: T.textSecondary, marginBottom: 20 },
  error: { color: T.hard, fontSize: 13, marginBottom: 12 },
  center: { alignItems: "center", marginVertical: 32 },
  cardsRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  userCard: { flex: 1, alignItems: "center" },
  userCardHighlight: { borderColor: T.primary },
  cardUsername: { fontSize: 13, color: T.textSecondary, marginBottom: 6 },
  cardTotal: { fontSize: 32, fontWeight: "800", color: T.textPrimary },
  cardTotalLabel: { fontSize: 11, color: T.textSecondary },
  cardRank: { fontSize: 13, color: T.accent, marginTop: 4 },
  vsWrap: { paddingHorizontal: 8 },
  vs: { fontSize: 14, fontWeight: "700", color: T.textSecondary },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: T.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  rowLabel: { fontSize: 13, color: T.textSecondary, flex: 1, textAlign: "center" },
  rowVal: { fontSize: 14, color: T.textPrimary, width: 70 },
  rowValRight: { textAlign: "right" },
  winVal: { color: T.accent, fontWeight: "700" },
});
