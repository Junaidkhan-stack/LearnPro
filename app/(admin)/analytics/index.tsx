import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyticsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      console.log("Analytics error:", err);
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
          Loading analytics...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="mb-5">
          <Text className="text-3xl font-bold text-textPrimary">
            Analytics
          </Text>
          <Text className="text-textSecondary text-sm mt-1">
            Platform insights & performance
          </Text>
        </View>

        {/* HERO CARD */}
        <View className="bg-indigo-600 rounded-3xl px-5 py-4 mb-5">
          <Text className="text-white text-[11px] opacity-80">
            TOTAL USERS
          </Text>

          <Text className="text-white text-3xl font-bold mt-1">
            {data?.users || 0}
          </Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="trending-up" size={14} color="#fff" />
            <Text className="text-white text-[11px] ml-1 opacity-90">
              Live system growth
            </Text>
          </View>
        </View>

        {/* ===== USER BREAKDOWN ===== */}
        <Text className="text-textPrimary font-semibold mb-2 text-sm">
          Users
        </Text>

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="school-outline" size={16} color="#22C55E" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Students
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.students || 0}
            </Text>
          </View>

          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="person-outline" size={16} color="#F59E0B" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Teachers
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.teachers || 0}
            </Text>
          </View>
        </View>

        {/* ===== COURSE STATUS ===== */}
        <Text className="text-textPrimary font-semibold mb-2 text-sm">
          Course Status
        </Text>

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Published
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.publishedCourses || 0}
            </Text>
          </View>

          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="time-outline" size={16} color="#F97316" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Pending
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.pendingCourses || 0}
            </Text>
          </View>
        </View>

        {/* ===== CONTENT ===== */}
        <Text className="text-textPrimary font-semibold mb-2 text-sm">
          Content
        </Text>

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="book-outline" size={16} color="#EF4444" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Courses
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.courses || 0}
            </Text>
          </View>

          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="videocam-outline" size={16} color="#06B6D4" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Lessons
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.lessons || 0}
            </Text>
          </View>
        </View>

        {/* ===== ACTIVITY ===== */}
        <Text className="text-textPrimary font-semibold mb-2 text-sm">
          Activity
        </Text>

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="layers-outline" size={16} color="#6366F1" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Enrollments
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.enrollments || 0}
            </Text>
          </View>

          <View className="flex-1 bg-surface border border-border rounded-xl px-3 py-3">
            <Ionicons name="help-circle-outline" size={16} color="#8B5CF6" />
            <Text className="text-[10px] text-textSecondary mt-1">
              Quizzes
            </Text>
            <Text className="text-lg font-bold text-textPrimary mt-1">
              {data?.quizzes || 0}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
<View className="mt-2 bg-surface border border-border rounded-2xl p-4">
  <View className="flex-row items-start">
    
    {/* ICON */}
    <View className="bg-primary/10 p-2 rounded-xl">
      <Ionicons name="analytics-outline" size={16} color="#4F46E5" />
    </View>

    {/* TEXT */}
    <View className="ml-3 flex-1">
      <Text className="text-textPrimary text-sm font-semibold">
        System Insight
      </Text>

      <Text className="text-textSecondary text-[11px] mt-1 leading-4">
        Platform metrics are updated in real-time, reflecting current user activity,
        course engagement, and overall system performance.
      </Text>
    </View>

  </View>
</View>
      </ScrollView>
    </SafeAreaView>
  );
}