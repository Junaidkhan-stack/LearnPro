import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "@/services/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      router.push({
        pathname: "/(auth)/verify-reset-otp",
        params: { userId: res.data.userId },
      });

    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-6 justify-center">
      <View className="bg-surface p-6 rounded-2xl border border-border">

        <Text className="text-2xl font-bold text-center text-textPrimary mb-2">
          Forgot Password
        </Text>

        <Text className="text-textSecondary text-center mb-6">
          Enter your email to receive OTP
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          className="border border-border bg-background px-4 py-3 rounded-lg mb-4 text-textPrimary"
        />

        <TouchableOpacity
          onPress={handleSendOTP}
          disabled={loading}
          className="bg-primary py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Sending..." : "Send OTP"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}