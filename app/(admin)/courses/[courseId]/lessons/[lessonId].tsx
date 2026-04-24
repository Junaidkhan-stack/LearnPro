import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

export default function LessonDetail() {
  // ✅ FIX: safe params handling (prevents string | string[])
  const params = useLocalSearchParams();

  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH LESSON ================= */
  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}`);
      setLesson(res.data);
    } catch (err) {
      console.log("Lesson error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH COURSE ================= */
  const fetchCourse = async () => {
    try {
      const res = await api.get("/admin/courses");
      const found = res.data.find((c: any) => c._id === courseId);
      setCourse(found);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLesson();
    fetchCourse();
  }, []);

  /* ================= VIDEO PLAYER ================= */
  const player = useVideoPlayer(lesson?.videoUrl, (player) => {
    player.loop = false;
  });

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator color="#4F46E5" size="large" />
        <Text className="text-textSecondary mt-2">
          Loading lesson details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <Text className="text-textPrimary">Lesson not found</Text>
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
          paddingBottom: 30,
        }}
      >
        {/* HEADER */}
        <View className="mb-5">
          <Text className="text-2xl font-bold text-textPrimary">
            Lesson Review
          </Text>
          <Text className="text-textSecondary">
            Review lesson content before approving course
          </Text>
        </View>

        {/* COURSE BADGE */}
        <View className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl mb-4 self-start">
          <Text className="text-indigo-600 font-semibold text-xs">
            COURSE: {course?.title || "Loading..."}
          </Text>
        </View>

        {/* LESSON TITLE */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-4">
          <Text className="text-xl font-bold text-textPrimary">
            {lesson.title}
          </Text>

          <Text className="text-textSecondary mt-2 text-sm">
            Lesson content and video resource
          </Text>
        </View>

        {/* VIDEO */}
        <View className="bg-black rounded-2xl overflow-hidden mb-6 border border-border">
          <VideoView player={player} style={{ width: "100%", height: 220 }} />
        </View>

        {/* INFO */}
        <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={18} color="#4F46E5" />
            <Text className="text-textPrimary font-semibold ml-2">
              Lesson Details
            </Text>
          </View>

          <Text className="text-textSecondary text-sm">
            This lesson is part of course:{" "}
            <Text className="text-textPrimary font-semibold">
              {course?.title || "Unknown Course"}
            </Text>
          </Text>
        </View>

        {/* REVIEW NOTE */}
        <View className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-10">
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle-outline" size={18} color="#4F46E5" />
            <Text className="ml-2 text-primary font-semibold">
              Admin Review Note
            </Text>
          </View>

          <Text className="text-textPrimary text-sm leading-5">
            Ensure this lesson has proper video quality, clear explanation, and
            aligns with course objectives before approving.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
