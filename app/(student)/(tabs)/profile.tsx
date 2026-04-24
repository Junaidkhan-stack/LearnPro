import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
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
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-6">
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-textPrimary">Profile</Text>
          <Text className="text-textSecondary text-sm mt-1">
            Your account information
          </Text>
        </View>

        {/* PROFILE CARD */}
        <View className="bg-surface border border-border rounded-2xl p-6 mb-6">
          {/* AVATAR */}
          <View className="items-center mb-4">
            <View className="bg-primary h-20 w-20 rounded-full items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </Text>
            </View>
          </View>

          {/* NAME */}
          <Text className="text-center text-lg font-semibold text-textPrimary">
            {user?.name ?? "Unknown"}
          </Text>

          {/* EMAIL */}
          <Text className="text-center text-textSecondary mt-1">
            {user?.email ?? "No email"}
          </Text>

          {/* ROLE */}
          <Text className="text-center text-primary mt-2 font-semibold">
            {user?.role?.toUpperCase() ?? "USER"}
          </Text>
        </View>

        {/* ACCOUNT INFO */}
        <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person-circle-outline" size={18} color="#4F46E5" />
            <Text className="text-textPrimary font-semibold ml-2">
              Account Info
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-textSecondary text-sm">User ID</Text>
            <Text className="text-textPrimary text-sm font-medium">
              {user?.id ?? "N/A"}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-textSecondary text-sm">Role</Text>
            <Text className="text-primary text-sm font-semibold">
              {user?.role ?? "N/A"}
            </Text>
          </View>
        </View>

        {/* LOGOUT */}
        <Pressable onPress={handleLogout} className="bg-danger py-3 rounded-xl">
          <Text className="text-white text-center font-semibold">Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
