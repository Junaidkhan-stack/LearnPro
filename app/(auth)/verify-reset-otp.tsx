import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";

export default function VerifyForgotOTP() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-forgot-otp", {
        userId,
        otp,
      });

      router.push({
        pathname: "/(auth)/reset-password",
        params: { userId },
      });

    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-6 justify-center">

      <View className="bg-surface p-6 rounded-2xl border border-border">

        <Text className="text-2xl font-bold text-center text-textPrimary mb-2">
          Verify OTP
        </Text>

        <Text className="text-textSecondary text-center mb-6">
          Enter the 6-digit code sent to your email
        </Text>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="OTP"
          keyboardType="number-pad"
          className="border border-border bg-background px-4 py-3 rounded-lg text-center text-lg tracking-widest mb-4"
        />

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading}
          className="bg-primary py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}