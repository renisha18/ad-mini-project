import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CalendarMap, fetchUserCalendar } from "./_utils/api";
import { useSession } from "./_layout";

type FriendEntry = {
  username: string;
  streak: number;
};

function sortKeysDesc(map: CalendarMap): string[] {
  return Object.keys(map).sort((a, b) => Number(b) - Number(a));
}

function calculateStreak(myCalendar: CalendarMap, friendCalendar: CalendarMap): number {
  const nowSec = Math.floor(Date.now() / 1000);
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const daySec = String(nowSec - i * 86400);
    const mineSolved = (myCalendar[daySec] ?? 0) > 0;
    const friendSolved = (friendCalendar[daySec] ?? 0) > 0;
    if (mineSolved && friendSolved) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function CalendarGrid(props: { calendar: CalendarMap }) {
  const days = useMemo(() => sortKeysDesc(props.calendar).slice(0, 84), [props.calendar]);

  if (days.length === 0) {
    return <Text style={styles.emptyText}>No calendar data</Text>;
  }

  return (
    <View style={styles.grid}>
      {days.map((day) => {
        const solved = (props.calendar[day] ?? 0) > 0;
        return (
          <View
            key={day}
            style={[styles.dayBox, solved ? styles.dayBoxActive : styles.dayBoxInactive]}
          />
        );
      })}
    </View>
  );
}

export default function FriendsScreen() {
  const session = useSession();
  const [friendInput, setFriendInput] = useState<string>("");
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [friendCalendars, setFriendCalendars] = useState<Record<string, CalendarMap>>({});
  const [myCalendar, setMyCalendar] = useState<CalendarMap | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const ensureMyCalendar = async (me: string): Promise<CalendarMap> => {
    if (myCalendar) return myCalendar;
    const cal = await fetchUserCalendar(me);
    setMyCalendar(cal);
    return cal;
  };

  const handleAdd = async () => {
    const me = (session.username ?? "").trim();
    const friend = friendInput.trim();
    if (!me || !friend) {
      setError("User not found");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [mine, friendCal] = await Promise.all([
        ensureMyCalendar(me),
        fetchUserCalendar(friend),
      ]);
      const streak = calculateStreak(mine, friendCal);
      setFriendCalendars((prev) => ({ ...prev, [friend]: friendCal }));
      setFriends((prev) => {
        const without = prev.filter((item) => item.username !== friend);
        return [...without, { username: friend, streak }];
      });
      setFriendInput("");
    } catch {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>Shared Streaks</Text>

      {!session.username ? (
        <View style={styles.card}>
          <Text style={styles.stateText}>Loading...</Text>
          <Text style={styles.helperText}>Go back and fetch your profile once.</Text>
        </View>
      ) : (
        <Text style={styles.meText}>You: {session.username}</Text>
      )}
      <TextInput
        value={friendInput}
        onChangeText={setFriendInput}
        placeholder="Add a friend's username"
        placeholderTextColor="#555"
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable onPress={handleAdd} style={styles.button}>
        <Text style={styles.buttonText}>+ Add Friend</Text>
      </Pressable>

      <Link href="/" style={styles.linkButton}>
        ← Back
      </Link>

      {loading ? <Text style={styles.stateText}>Loading...</Text> : null}
      {!loading && error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {friends.map((friend) => (
          <View key={friend.username} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>{friend.username}</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {friend.streak} day streak</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.calendarLabel}>Activity</Text>
              <CalendarGrid calendar={friendCalendars[friend.username] ?? {}} />
            </View>
          </View>
        ))}
      </ScrollView>
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
  scrollContainer: {
    paddingBottom: 24,
  },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#262626",
    borderRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cardHeaderText: {
    color: "#FFA116",
    fontWeight: "800",
    fontSize: 15,
  },
  streakBadge: {
    backgroundColor: "#2E2A1A",
    borderWidth: 1,
    borderColor: "#FFA11633",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  streakText: {
    color: "#FFA116",
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    padding: 14,
  },
  calendarLabel: {
    color: "#555",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptyText: {
    color: "#555",
    fontSize: 13,
    fontStyle: "italic",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  dayBox: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
  dayBoxActive: {
    backgroundColor: "#FFA116",
  },
  dayBoxInactive: {
    backgroundColor: "#2E2E2E",
  },
});