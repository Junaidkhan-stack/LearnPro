// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

function AuthGate() {
  const { token, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // still loading user info, do nothing

    const inAuthGroup = segments[0] === "(auth)";

    // If not logged in, redirect to login
    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // If logged in and in auth group, redirect based on role
    if (token && inAuthGroup && user) {
      switch (user.role) {
        case "student":
          router.replace("/(student)/(tabs)");
          break;
        case "teacher":
          router.replace("/(teacher)/(tabs)");
          break;
        case "admin":
          router.replace("/(admin)/(tabs)");
          break;
        default:
          router.replace("/(auth)/login"); // fallback if role unknown
      }
    }
  }, [token, isLoading, user, segments, router]);

  // Loading screen while user info is fetched
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}