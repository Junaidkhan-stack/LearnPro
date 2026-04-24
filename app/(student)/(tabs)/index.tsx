import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

/* ================= PREMIUM COURSE CARD ================= */
const CourseCard = ({ course }: any) => {
  const router = useRouter();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    setTimeout(() => {
      progress.value = withTiming(Number(course.progress || 0) / 100, {
        duration: 800,
      });
    }, 50);
  }, [course.progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const isCompleted = course.status === "completed";

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      className="bg-surface mb-4 p-5 rounded-2xl border border-border"
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-textPrimary font-semibold text-base">
            {course.title || "Untitled Course"}
          </Text>

          <Text className="text-textSecondary text-xs mt-1">
            {isCompleted ? "Completed Course" : "Keep learning"}
          </Text>
        </View>

        {/* STATUS BADGE */}
        <View
          className={`px-3 py-1 rounded-full ${
            isCompleted ? "bg-green-100" : "bg-indigo-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              isCompleted ? "text-green-700" : "text-primary"
            }`}
          >
            {isCompleted ? "Done" : "Active"}
          </Text>
        </View>
      </View>

      {/* PROGRESS BAR */}
      <View className="mt-4">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <Animated.View
            className="h-2 bg-primary rounded-full"
            style={progressStyle}
          />
        </View>

        <Text className="text-textSecondary text-xs mt-2">
          {Math.round(course.progress || 0)}% Progress
        </Text>
      </View>

      {/* ACTION */}
      <Pressable
        onPress={() => router.push(`/course/${course.id}`)}
        className="mt-4"
      >
        <View
          className={`py-2 rounded-xl items-center ${
            isCompleted ? "bg-green-600" : "bg-primary"
          }`}
        >
          <Text className="text-white font-semibold text-sm">
            {isCompleted ? "Review Course" : "Continue Learning"}
          </Text>
        </View>
      </Pressable>
    </Pressable>
  );
};

/* ================= DASHBOARD ================= */
export default function StudentDashboard() {
  const fade = useSharedValue(0);
  const translate = useSharedValue(10);

  const [courses, setCourses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/student/courses");
      const list = res.data || [];

      const enriched = [];

      for (let course of list) {
        try {
          const progressRes = await api.get(
            `/enrollment/progress/${course.id}`,
          );

          enriched.push({
            ...course,
            progress: progressRes.data?.overallProgress || 0,
            status: progressRes.data?.status || "in-progress",
          });
        } catch {}
      }

      setCourses(enriched);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  useEffect(() => {
    fade.value = withTiming(1, { duration: 500 });
    translate.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: translate.value }],
  }));

  const activeCourses = courses
    .filter((c) => c.status !== "completed")
    .sort((a, b) => b.progress - a.progress);

  const completedCourses = courses.filter((c) => c.status === "completed");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <Animated.View style={animStyle}>
          {/* HEADER */}
          <Text className="text-2xl font-bold text-textPrimary">
            My Learning
          </Text>
          <Text className="text-textSecondary mb-6">Track your progress</Text>

          {/* ================= STATS CARDS ================= */}
          <View className="flex-row justify-between mb-6">
            {/* ENROLLED */}
            <View className="flex-1 mr-2 bg-surface border border-border p-4 rounded-2xl">
              <View className="flex-row items-center">
                <Ionicons name="book-outline" size={16} color="#6366F1" />
                <Text className="text-textSecondary text-xs ml-1">
                  Enrolled
                </Text>
              </View>

              <Text className="text-textPrimary text-xl font-bold mt-2">
                {courses.length}
              </Text>
            </View>

            {/* COMPLETED */}
            <View className="flex-1 ml-2 bg-surface border border-border p-4 rounded-2xl">
              <View className="flex-row items-center">
                <Ionicons name="trophy-outline" size={16} color="#16A34A" />
                <Text className="text-textSecondary text-xs ml-1">
                  Completed
                </Text>
              </View>

              <Text className="text-success text-xl font-bold mt-2">
                {completedCourses.length}
              </Text>
            </View>
          </View>

          {/* ================= CONTINUE LEARNING ================= */}
          {activeCourses.length > 0 && (
            <>
              <Text className="text-textPrimary font-semibold mb-3">
                Continue Learning 🚀
              </Text>

              {activeCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </>
          )}

          {/* ================= COMPLETED ================= */}
          {completedCourses.length > 0 && (
            <>
              <Text className="text-textPrimary font-semibold mt-6 mb-3">
                Completed Courses 🎓
              </Text>

              {completedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </>
          )}

          {/* ================= EMPTY STATE ================= */}
          {courses.length === 0 && (
            <View className="items-center mt-20">
              <Ionicons name="school-outline" size={50} color="#9CA3AF" />
              <Text className="text-textSecondary mt-3">
                No courses enrolled yet
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
