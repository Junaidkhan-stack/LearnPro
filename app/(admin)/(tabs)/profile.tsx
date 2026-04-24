import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function AdminProfileScreen() {
  const { user, isLoading, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");

      console.log("🔥 ADMIN PROFILE:", res.data);

      setProfile(res.data);
    } catch (error) {
      console.log("❌ Admin Profile API failed:", error);

      // fallback to context
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  /* ================= LOADING ================= */
  if (isLoading || loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-textSecondary mt-2">
          Loading admin profile...
        </Text>
      </SafeAreaView>
    );
  }

  const data = profile ?? user;

  if (!data) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-6">

        {/* TITLE */}
        <Text className="text-2xl font-bold text-textPrimary mb-6">
          Admin Profile
        </Text>

        {/* PROFILE CARD */}
        <View className="bg-surface p-6 rounded-2xl border border-border mb-6">

          {/* AVATAR */}
          <View className="items-center mb-4">
            <View className="bg-primary h-20 w-20 rounded-full items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {data?.name?.charAt(0)?.toUpperCase() || "A"}
              </Text>
            </View>
          </View>

          {/* NAME */}
          <Text className="text-center text-lg font-semibold text-textPrimary">
            {data?.name || "Admin"}
          </Text>

          {/* EMAIL */}
          <Text className="text-center text-textSecondary mt-1">
            {data?.email || "No Email"}
          </Text>

          {/* ROLE */}
          <Text className="text-center text-primary mt-2 font-semibold">
            {data?.role?.toUpperCase() || "ADMIN"}
          </Text>
        </View>

        {/* ACCOUNT INFO */}
        <View className="bg-surface p-4 rounded-2xl border border-border mb-6">

          <Text className="text-textPrimary font-semibold mb-3">
            Account Info
          </Text>

          <View className="flex-row justify-between">
            <Text className="text-textSecondary">User ID</Text>
            <Text className="text-textPrimary text-sm">
              {data?.id || data?._id || "N/A"}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-textSecondary">Role</Text>
            <Text className="text-primary font-semibold">
              {data?.role || "N/A"}
            </Text>
          </View>

        </View>

        {/* ADMIN PRIVILEGES CARD */}
        <View className="bg-surface p-4 rounded-2xl border border-border mb-6">

          <Text className="text-textPrimary font-semibold mb-2">
            Admin Privileges
          </Text>

          <Text className="text-textSecondary">
            Full access to manage users, courses, analytics, and system settings.
          </Text>

        </View>

        {/* LOGOUT */}
        <Pressable
          onPress={handleLogout}
          className="bg-danger py-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Logout
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}