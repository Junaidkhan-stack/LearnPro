import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function Lessons() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchLessons = async () => {
    try {
      const res = await api.get(`/lessons/courses/${courseId}/lessons`);
      setLessons(res.data);
    } catch (error: any) {
      console.log("❌ FETCH ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL + AUTO REFRESH ================= */
  useEffect(() => {
    if (!courseId) return;

    fetchLessons();

    const interval = setInterval(() => {
      fetchLessons();
    }, 5000); // 🔥 auto refresh every 5 seconds

    return () => clearInterval(interval);
  }, [courseId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-textPrimary">Lessons</Text>
            <Text className="text-textSecondary">
              Manage your course lessons
            </Text>
          </View>

          {/* ADD BUTTON */}
          <Pressable
            onPress={() =>
              router.push(
                `/(teacher)/courses/${courseId}/builder/lessons/create`,
              )
            }
            className="bg-primary px-4 py-3 rounded-2xl"
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* EMPTY STATE */}
        {lessons.length === 0 ? (
          <View className="items-center mt-20">
            <Ionicons name="videocam-outline" size={50} color="#9CA3AF" />
            <Text className="text-textSecondary mt-3">No lessons yet</Text>
          </View>
        ) : (
          lessons.map((lesson, index) => (
            <Pressable
              key={lesson._id}
              onPress={() =>
                router.push(
                  `/(teacher)/courses/${courseId}/builder/lessons/${lesson._id}`,
                )
              }
              className="bg-surface p-5 rounded-3xl mb-3 border border-border active:scale-[0.98]"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center">
                  <Text className="text-indigo-600 font-bold">
                    {index + 1}
                  </Text>
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-textPrimary font-semibold">
                    {lesson.title}
                  </Text>
                  <Text className="text-textSecondary text-xs mt-1">
                    Video Lesson
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}