import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext"; // ✅ ADD THIS

export default function Signup() {
  const { login } = useAuth(); // ✅ ADD THIS

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("✅ Signup response:", res.data);

      // ✅ MOST IMPORTANT FIX
      await login(res.data.token, res.data.user);

      // ❌ REMOVE THIS (VERY IMPORTANT)
      // router.replace("/login");

      Alert.alert("Success", "Account created successfully ✅");

    } catch (error: any) {
      console.log("SIGNUP ERROR:", error?.response?.data || error.message);

      Alert.alert(
        "Signup failed",
        error?.response?.data?.message || "Something went wrong"
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
          Create Account
        </Text>
        <Text className="text-textSecondary mt-2 text-center">
          Start your learning journey with LearnPro
        </Text>
      </View>

      {/* Name */}
      <View className="mb-4">
        <Text className="text-sm text-textSecondary mb-1">Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
          className="bg-surface border border-border rounded-lg px-4 py-3 text-textPrimary"
        />
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
          placeholder="Create a password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          className="bg-surface border border-border rounded-lg px-4 py-3 text-textPrimary"
        />
      </View>

      {/* Signup Button */}
      <TouchableOpacity
        onPress={handleSignup}
        disabled={loading}
        className="bg-primary py-4 rounded-lg items-center"
      >
        <Text className="text-white text-lg font-semibold">
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View className="flex-row justify-center mt-6">
        <Text className="text-textSecondary">
          Already have an account?
        </Text>
        <Link href="/login" className="text-primary font-semibold ml-1">
          Login
        </Link>
      </View>
    </View>
  );
}