import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AdminHome() {
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">
          Loading dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  const Card = ({ title, value, icon, color }: any) => (
    <View className="bg-surface border border-border rounded-2xl p-4 flex-1 m-1">
      <View className="flex-row justify-between items-center">
        <Ionicons name={icon} size={20} color={color} />
        <Text className="text-textSecondary text-xs">{title}</Text>
      </View>

      <Text className="text-2xl font-bold text-textPrimary mt-3">
        {value ?? 0}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 30,
        }}
      >
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-textPrimary">
            Admin Dashboard
          </Text>
          <Text className="text-textSecondary text-sm mt-1">
            System overview & quick control center
          </Text>
        </View>

        {/* QUICK ACTIONS */}
        <View className="flex-row gap-2 mb-6">
          <Pressable
            onPress={() => router.push("/(admin)/users/create")}
            className="flex-1 bg-indigo-600 p-3 rounded-2xl"
          >
            <Text className="text-white text-center font-semibold">
              + User
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(admin)/(tabs)/courses")}
            className="flex-1 bg-indigo-500 p-3 rounded-2xl"
          >
            <Text className="text-white text-center font-semibold">
              Courses
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(admin)/analytics")}
            className="flex-1 bg-indigo-700 p-3 rounded-2xl"
          >
            <Text className="text-white text-center font-semibold">
              Stats
            </Text>
          </Pressable>
        </View>

        {/* CORE METRICS */}
        <View className="flex-row flex-wrap justify-between">
          <Card title="Users" value={data?.users} icon="people" color="#4F46E5" />
          <Card title="Students" value={data?.students} icon="school" color="#22C55E" />
        </View>

        <View className="flex-row flex-wrap justify-between">
          <Card title="Teachers" value={data?.teachers} icon="person" color="#F59E0B" />
          <Card title="Courses" value={data?.courses} icon="book" color="#EF4444" />
        </View>

        <View className="flex-row flex-wrap justify-between">
          <Card title="Published" value={data?.publishedCourses} icon="checkmark-circle" color="#10B981" />
          <Card title="Pending" value={data?.pendingCourses} icon="time" color="#F97316" />
        </View>

        {/* SYSTEM ACTIVITY */}
        <Text className="text-textPrimary font-semibold mt-6 mb-2">
          System Activity
        </Text>

        <View className="flex-row flex-wrap justify-between">
          <Card title="Enrollments" value={data?.enrollments} icon="layers" color="#6366F1" />
          <Card title="Lessons" value={data?.lessons} icon="videocam" color="#06B6D4" />
        </View>

        <View className="flex-row flex-wrap justify-between">
          <Card title="Assignments" value={data?.assignments} icon="document-text" color="#EC4899" />
          <Card title="Quizzes" value={data?.quizzes} icon="help-circle" color="#8B5CF6" />
        </View>

        {/* FOOTER */}
        <View className="mt-6 bg-surface border border-border p-4 rounded-2xl">
          <Text className="text-textSecondary text-xs">
            🚀 Admin system running in real-time mode
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}