import { StyleSheet, Text, View } from "react-native";
import { T } from "../../constants/theme";

type Props = {
  label: string;
  solved: number;
  total: number;
  color: string;
};

export default function ProgressBar({ label, solved, total, color }: Props) {
  const pct = total > 0 ? Math.min(solved / total, 1) : 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        <Text style={styles.count}>{solved} / {total}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { fontSize: 13, fontWeight: "600" },
  count: { fontSize: 13, color: T.textSecondary },
  track: { height: 6, backgroundColor: T.border, borderRadius: 99, overflow: "hidden" },
  fill: { height: 6, borderRadius: 99 },
});
