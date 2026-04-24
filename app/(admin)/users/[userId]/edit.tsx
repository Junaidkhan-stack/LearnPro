import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function EditUserScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const userId = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= FETCH USER ================= */
  const fetchUser = async () => {
    try {
      const res = await api.get("/admin/users");
      const found = res.data.find((u: any) => u._id === userId);
      setUser(found);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  /* ================= ROLE SWITCH ================= */
  const toggleRole = () => {
    const newRole =
      user.role === "student"
        ? "teacher"
        : user.role === "teacher"
        ? "student"
        : "student";

    Alert.alert(
      "Change Role",
      `Change role from ${user.role} to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Change",
          onPress: async () => {
            try {
              setActionLoading(true);

              await api.put(`/admin/users/${userId}/role`, {
                role: newRole,
              });

              setUser({ ...user, role: newRole });
            } catch (err) {
              console.log(err);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  /* ================= BLOCK USER ================= */
  const toggleBlock = () => {
    const action = user.isBlocked ? "Unblock" : "Block";

    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: user.isBlocked ? "default" : "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);

              await api.put(`/admin/users/${userId}/block`, {
                isBlocked: !user.isBlocked,
              });

              setUser({ ...user, isBlocked: !user.isBlocked });
            } catch (err) {
              console.log(err);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  /* ================= DELETE USER ================= */
  const deleteUser = () => {
    Alert.alert("Delete User", "This action cannot be undone", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true);

            await api.delete(`/admin/users/${userId}`);

            router.replace({
              pathname: "/users",
            });
          } catch (err) {
            console.log(err);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  /* ================= LOADING ================= */
  if (loading || !user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">Loading user...</Text>
      </SafeAreaView>
    );
  }

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
        <Text className="text-2xl font-bold text-textPrimary">Edit User</Text>
        <Text className="text-textSecondary mb-6">Admin control panel</Text>

        {/* USER CARD */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-5">
          <View className="flex-row items-center">
            <Ionicons name="person-circle" size={52} color="#4F46E5" />

            <View className="ml-3 flex-1">
              <Text className="text-textPrimary text-lg font-bold">
                {user.name}
              </Text>
              <Text className="text-textSecondary text-sm">{user.email}</Text>
            </View>
          </View>

          {/* ROLE BADGE */}
          <View className="mt-4 flex-row gap-2">
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text className="text-indigo-600 text-xs font-bold uppercase">
                {user.role}
              </Text>
            </View>

            <View
              className={`px-3 py-1 rounded-full ${
                user.isBlocked ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  user.isBlocked ? "text-red-600" : "text-green-600"
                }`}
              >
                {user.isBlocked ? "BLOCKED" : "ACTIVE"}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <Text className="text-textPrimary font-semibold mb-3">Actions</Text>

        {/* SWITCH ROLE */}
        <Pressable
          onPress={toggleRole}
          disabled={actionLoading}
          className="bg-primary/10 p-4 rounded-2xl mb-3 flex-row items-center justify-center"
        >
          <Ionicons name="swap-horizontal" size={18} color="#4F46E5" />
          <Text className="text-primary font-semibold ml-2">Switch Role</Text>
        </Pressable>

        {/* BLOCK / UNBLOCK */}
        <Pressable
          onPress={toggleBlock}
          disabled={actionLoading}
          className={`p-4 rounded-2xl mb-3 flex-row items-center justify-center ${
            user.isBlocked ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Ionicons
            name={user.isBlocked ? "lock-open" : "lock-closed"}
            size={18}
            color={user.isBlocked ? "#22C55E" : "#EF4444"}
          />
          <Text
            className={`ml-2 font-semibold ${
              user.isBlocked ? "text-green-600" : "text-red-600"
            }`}
          >
            {user.isBlocked ? "Unblock User" : "Block User"}
          </Text>
        </Pressable>

        {/* DELETE */}
        <Pressable
          onPress={deleteUser}
          disabled={actionLoading}
          className="bg-red-500 p-4 rounded-2xl flex-row items-center justify-center"
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">Delete User</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}