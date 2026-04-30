import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/services/api";

export default function VerifyScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ================= VERIFY OTP ================= */
  const handleVerify = async () => {
    if (otp.length < 6) {
      return Alert.alert("Error", "Enter valid OTP");
    }

    setLoading(true);
    try {
      await api.post("/auth/verify", {
        userId,
        otp,
      });

      Alert.alert("Success", "Email verified successfully");

      // 🔥 Auto navigate to login
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { userId });

      Alert.alert("Success", "OTP resent to your email");
      setTimer(60); // 🔥 reset timer
    } catch (err) {
      Alert.alert("Error", "Failed to resend OTP");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 justify-center">
      {/* TITLE */}
      <Text className="text-2xl font-bold text-foreground text-center mb-2">
        Verify Email
      </Text>
      <Text className="text-muted-foreground text-center mb-6">
        Enter the OTP sent to your email
      </Text>

      {/* OTP INPUT */}
      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        className="bg-surface border border-border rounded-xl px-4 py-3 text-center text-lg text-foreground"
      />

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        className={`mt-6 py-3 rounded-xl ${
          loading ? "bg-gray-400" : "bg-primary"
        }`}
      >
        <Text className="text-center text-white font-semibold">
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      {/* TIMER / RESEND */}
      <View className="mt-6 items-center">
        {timer > 0 ? (
          <Text className="text-muted-foreground">
            Resend OTP in {timer}s
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text className="text-primary font-semibold">
              Resend OTP
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}