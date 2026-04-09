import { StyleSheet, View, ViewProps } from "react-native";
import { T } from "../../constants/theme";

export default function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.card,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: T.padding,
    marginBottom: 12,
  },
});
