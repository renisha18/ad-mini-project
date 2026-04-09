import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { signupUser } from "../services/storage";

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
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await signupUser(username, password);
      if (!result.ok) {
        setError(result.message ?? "Signup failed");
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="LeetCode Username"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        style={styles.input}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Signup"}</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.link} onPress={onGoLogin}>
        <Text style={styles.linkText}>Back to login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#000", color: "#000", padding: 12, marginBottom: 10 },
  button: { borderWidth: 1, borderColor: "#000", padding: 12, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#000", fontWeight: "700" },
  error: { color: "#000", marginTop: 10, fontWeight: "700" },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#000", textDecorationLine: "underline" },
});

