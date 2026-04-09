import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { T } from "../../constants/theme";

export default function AppInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={T.textSecondary}
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: T.card,
    color: T.textPrimary,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: T.padding,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 12,
  },
});
