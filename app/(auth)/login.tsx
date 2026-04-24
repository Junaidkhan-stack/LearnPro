import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      await login(token, user);
    } catch (error: any) {
      console.log("LOGIN ERROR:", error?.response?.data || error.message);

      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-6 justify-center">
      {/* Header */}
      <View className="mb-10 items-center">
        <Text className="text-3xl font-bold text-textPrimary">
          Welcome Back
        </Text>
        <Text className="text-textSecondary mt-2 text-center">
          Login to continue learning
        </Text>
      </View>

      {/* Email */}
      <View className="mb-4">
        <Text className="text-sm text-textSecondary mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-surface border border-border rounded-lg px-4 py-3 text-textPrimary"
        />
      </View>

      {/* Password */}
      <View className="mb-6">
        <Text className="text-sm text-textSecondary mb-1">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          className="bg-surface border border-border rounded-lg px-4 py-3 text-textPrimary"
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-primary py-4 rounded-lg items-center"
      >
        <Text className="text-white text-lg font-semibold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View className="mt-6 items-center">
        <View className="flex-row">
          <Text className="text-textSecondary">Don’t have an account?</Text>
          <Link href="/signup" className="text-primary font-semibold ml-1">
            Sign up
          </Link>
        </View>
      </View>
    </View>
  );
}
