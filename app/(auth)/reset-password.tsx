import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";

export default function ResetPassword() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password) {
      Alert.alert("Error", "Enter new password");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        userId,
        newPassword: password,
      });

      Alert.alert("Success", "Password reset successful");

      router.replace("/(auth)/login");

    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-6 justify-center">

      <View className="bg-surface p-6 rounded-2xl border border-border">

        <Text className="text-2xl font-bold text-center text-textPrimary mb-2">
          New Password
        </Text>

        <Text className="text-textSecondary text-center mb-6">
          Create a strong password
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          secureTextEntry
          className="border border-border bg-background px-4 py-3 rounded-lg mb-4 text-textPrimary"
        />

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="bg-primary py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Updating..." : "Reset Password"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}