import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

export default function LessonsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ FIX PARAM TYPE (IMPORTANT)
  const courseId =
    Array.isArray(params.courseId)
      ? params.courseId[0]
      : params.courseId;

  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH LESSONS ================= */
  const fetchLessons = async () => {
    try {
      const res = await api.get(
        `/lessons/courses/${courseId}/lessons`
      );

      console.log("📚 LESSONS:", res.data);

      setLessons(res.data);
    } catch (error) {
      console.log("❌ Lessons error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLessons();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">
          Loading lessons...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 30,
        }}
      >
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-textPrimary">
            Course Lessons
          </Text>
          <Text className="text-textSecondary">
            Review course content before approval
          </Text>
        </View>

        {/* EMPTY STATE */}
        {lessons.length === 0 && (
          <View className="items-center mt-16">
            <Ionicons name="book-outline" size={50} color="#9CA3AF" />
            <Text className="text-textPrimary font-semibold mt-3 text-lg">
              No lessons found
            </Text>
            <Text className="text-textSecondary text-center mt-1">
              This course does not contain any lessons yet
            </Text>
          </View>
        )}

        {/* LESSON LIST */}
        {lessons.map((lesson, index) => (
          <Pressable
            key={lesson._id}
            onPress={() =>
              router.push({
                pathname:
                  "/(admin)/courses/[courseId]/lessons/[lessonId]",
                params: {
                  courseId,
                  lessonId: lesson._id,
                },
              })
            }
            className="bg-surface border border-border rounded-2xl p-5 mb-4"
          >
            {/* TOP */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text className="text-textPrimary font-semibold text-lg">
                  {index + 1}. {lesson.title}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  Lesson
                </Text>
              </View>

              <View className="bg-indigo-50 p-2 rounded-full">
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#4F46E5"
                />
              </View>
            </View>

            {/* SEPARATOR */}
            <View className="h-[1px] bg-border my-3 opacity-60" />

            {/* FOOTER */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
  {/* ORDER */}
  <Text className="text-textSecondary text-xs">
    Lesson: {lesson.order || index + 1}
  </Text>

  {/* VIDEO STATUS */}
  <Text className="text-xs text-success">
    {lesson.videoUrl ? "Video Added" : "No Video"}
  </Text>
</View>

              <View className="bg-indigo-50 px-2 py-1 rounded-md">
                <Text className="text-indigo-600 text-xs font-medium">
                  Open
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}