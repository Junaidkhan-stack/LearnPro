import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext"; // adjust path if needed

export default function Index() {
  const router = useRouter();
  const { token, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.replace("/(auth)/login");
      return;
    }

    if (user?.role === "student") {
      router.replace("/(student)/(tabs)");
      return;
    }

    if (user?.role === "teacher") {
      router.replace("/(teacher)/(tabs)");
      return;
    }

    if (user?.role === "admin") {
      router.replace("/(admin)/(tabs)");
      return;
    }
  }, [token, user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}