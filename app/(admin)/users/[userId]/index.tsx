import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function UserDetail() {
  const params = useLocalSearchParams();

  const userId = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;

  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */
  const fetchUser = async () => {
    try {
      const res = await api.get("/admin/users");
      const found = res.data.find((u: any) => u._id === userId);
      setUser(found);
    } catch (err) {
      console.log("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <Text className="text-textPrimary">User not found</Text>
      </SafeAreaView>
    );
  }

  const roleColor =
    user.role === "admin"
      ? "bg-purple-100 text-purple-600"
      : user.role === "teacher"
      ? "bg-blue-100 text-blue-600"
      : "bg-green-100 text-green-600";

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
      >
        
        {/* HEADER */}
        <Text className="text-2xl font-bold text-textPrimary">
          User Profile
        </Text>
        <Text className="text-textSecondary mb-6">
          View user details and activity
        </Text>

        {/* PROFILE CARD */}
        <View className="bg-surface border border-border p-5 rounded-2xl mb-5">

          <View className="flex-row items-center">
            <Ionicons name="person-circle-outline" size={52} color="#4F46E5" />

            <View className="ml-3 flex-1">
              <Text className="text-textPrimary text-lg font-semibold">
                {user.name}
              </Text>
              <Text className="text-textSecondary text-sm">
                {user.email}
              </Text>
            </View>
          </View>

          {/* ROLE */}
          <View className={`mt-4 self-start px-3 py-1 rounded-full ${roleColor}`}>
            <Text className="text-xs font-semibold uppercase">
              {user.role}
            </Text>
          </View>

          {/* STATUS */}
          <View className="mt-3">
            <Text
              className={`text-sm font-semibold ${
                user.isBlocked ? "text-red-500" : "text-green-500"
              }`}
            >
              {user.isBlocked ? "BLOCKED USER" : "ACTIVE USER"}
            </Text>
          </View>
        </View>

        {/* ACTION TITLE */}
        <Text className="text-textPrimary font-semibold mb-3">
          Quick Actions
        </Text>

        {/* EDIT USER BUTTON */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(admin)/users/[userId]/edit",
              params: { userId: String(userId) },
            })
          }
          className="bg-primary py-4 rounded-xl mb-3 flex-row justify-center items-center"
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">
            Edit User
          </Text>
        </Pressable>

        {/* ENROLLMENTS */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(admin)/users/[userId]/enrollments",
              params: { userId: String(userId) },
            })
          }
          className="bg-indigo-100 py-4 rounded-xl flex-row justify-center items-center"
        >
          <Ionicons name="school-outline" size={18} color="#4F46E5" />
          <Text className="text-primary font-semibold ml-2">
            View Enrollments
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}