import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { signupUser } from "../services/storage";
import { T } from "../constants/theme";
import AppInput from "../components/ui/AppInput";
import AppButton from "../components/ui/AppButton";

type Props = {
  onSuccess: () => void;
  onGoLogin: () => void;
};

export default function SignupScreen({ onSuccess, onGoLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const result = await signupUser(username, password);
      if (!result.ok) { setError(result.message ?? "Signup failed"); return; }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.appTitle}>LeetTrack</Text>
          <Text style={styles.subtitle}>Start your journey.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Create account</Text>
          <AppInput
            value={username}
            onChangeText={setUsername}
            placeholder="LeetCode Username"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AppInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <AppInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <AppButton label="Sign Up" loading={loading} onPress={handleSignup} style={styles.mt4} />
          <TouchableOpacity onPress={onGoLogin} style={styles.linkWrap}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: T.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: T.padding * 1.5 },
  header: { alignItems: "center", marginBottom: 40 },
  appTitle: { fontSize: 36, fontWeight: "800", color: T.accent, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: T.textSecondary, marginTop: 4 },
  form: { width: "100%" },
  formTitle: { fontSize: 22, fontWeight: "700", color: T.textPrimary, marginBottom: 20 },
  error: { color: T.hard, fontSize: 13, marginBottom: 10 },
  mt4: { marginTop: 4 },
  linkWrap: { alignItems: "center", marginTop: 8 },
  linkText: { color: T.textSecondary, fontSize: 14 },
  linkAccent: { color: T.accent, fontWeight: "600" },
});
