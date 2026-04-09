import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { loginUser } from "../services/storage";

type Props = {
  onSuccess: () => void;
  onGoSignup: () => void;
};

export default function LoginScreen({ onSuccess, onGoSignup }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await loginUser(username, password);
      if (!result.ok) {
        setError(result.message ?? "Invalid credentials");
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.link} onPress={onGoSignup}>
        <Text style={styles.linkText}>Create account</Text>
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

