import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator color="#4F46E5" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* HEADER (ONLY ADD BUTTON HERE) */}
      <View className="px-5 pt-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-textPrimary">
            User Management
          </Text>
          <Text className="text-textSecondary mt-1">
            Manage all platform users
          </Text>
        </View>

        {/* ✅ CREATE USER BUTTON */}
        <Pressable
          onPress={() => router.push("/(admin)/users/create")}
          className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white ml-2 font-semibold">
            Create
          </Text>
        </Pressable>
      </View>

      {/* LIST */}
      <FlatList
        data={users}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View className="bg-surface border border-border p-4 rounded-2xl mb-4">

            <Text className="text-textPrimary font-semibold text-lg">
              {item.name}
            </Text>
            <Text className="text-textSecondary text-sm">
              {item.email}
            </Text>

            <View className="flex-row justify-between mt-3">
              <Text className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600">
                {item.role}
              </Text>

              <Text
                className={`text-xs px-3 py-1 rounded-full ${
                  item.isBlocked
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {item.isBlocked ? "BLOCKED" : "ACTIVE"}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(admin)/users/[userId]",
                  params: { userId: item._id },
                })
              }
              className="mt-4 bg-indigo-600 py-3 rounded-xl flex-row justify-center items-center"
            >
              <Ionicons name="eye-outline" color="#fff" size={18} />
              <Text className="text-white ml-2 font-semibold">
                View Profile
              </Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}