import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { T } from "../../constants/theme";

type Props = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "ghost";
};

export default function AppButton({ label, loading, variant = "primary", style, ...rest }: Props) {
  const bg =
    variant === "danger" ? T.hard :
    variant === "ghost" ? "transparent" : T.primary;
  const border = variant === "ghost" ? T.border : "transparent";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.btn, { backgroundColor: bg, borderColor: border }, style]}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: T.radius,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
