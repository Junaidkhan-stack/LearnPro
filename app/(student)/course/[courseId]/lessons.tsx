import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";

type Lesson = {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
};

export default function LessonsScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const fetchLessons = async () => {
    try {
      const res = await api.get(
        `/student/courses/${courseId}/lessons`
      );

      const formatted = res.data.map((lesson: any) => ({
        id: String(lesson.id),
        title: lesson.title,
        duration: lesson.duration
          ? `${Math.floor(lesson.duration / 60)}:${String(
              lesson.duration % 60
            ).padStart(2, "0")}`
          : "0:00",
        completed: lesson.completed || false,
      }));

      setLessons(formatted);
    } catch (error: any) {
      console.log("❌ Lessons fetch error:", error?.response?.data);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  /* ✅ AUTO REFRESH */
  useFocusEffect(
    useCallback(() => {
      fetchLessons();
    }, [])
  );

  const renderItem = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/course/${courseId}/lesson/${item.id}`)
      }
      className="mx-4 mt-4"
      activeOpacity={0.85}
    >
      <View className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-200">

        {/* ICON */}
        <View className="mr-4">
          {item.completed ? (
            <View className="bg-green-100 p-2 rounded-full">
              <Ionicons name="checkmark" size={18} color="#22c55e" />
            </View>
          ) : (
            <View className="bg-indigo-100 p-2 rounded-full">
              <Ionicons name="play" size={18} color="#4F46E5" />
            </View>
          )}
        </View>

        {/* TEXT SECTION */}
        <View className="flex-1">
          {/* TITLE (STRONG) */}
          <Text className="text-base font-bold text-gray-900">
            {item.title}
          </Text>

          {/* META INFO (BETTER CONTRAST) */}
          <View className="flex-row items-center mt-1">

            <Text className="text-xs text-gray-500">
              Tap to start
            </Text>
          </View>
        </View>

        {/* ARROW (MATCH TEACHER UI) */}
        <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      
      {/* HEADER */}
      <View className="px-4 pt-3 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          Lessons
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Continue your learning journey
        </Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}