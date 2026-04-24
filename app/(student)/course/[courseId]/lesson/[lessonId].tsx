import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

const { width } = Dimensions.get("window");

export default function LessonPlayerScreen() {
  const { courseId, lessonId } = useLocalSearchParams();
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [lessons, setLessons] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  /* ================= FETCH LESSON VIDEO ================= */
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        setVideoUrl(res.data.videoUrl);
      } catch (error) {
        console.log("❌ Lesson fetch error:", error);
      }
    };

    fetchLesson();
  }, [lessonId]);

  /* ================= FETCH ALL LESSONS + COMPLETION ================= */
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(`/student/courses/${courseId}/lessons`);

        setLessons(res.data);

        const index = res.data.findIndex(
          (l: any) => String(l.id) === String(lessonId),
        );

        setCurrentIndex(index);

        // ✅ IMPORTANT FIX: SET COMPLETION FROM BACKEND
        const currentLesson = res.data.find(
          (l: any) => String(l.id) === String(lessonId),
        );

        if (currentLesson?.completed) {
          setCompleted(true);
          setProgress(currentLesson.watchPercentage / 100);
        }
      } catch (error) {
        console.log("❌ Lessons list error:", error);
      }
    };

    fetchLessons();
  }, [courseId, lessonId]);

  /* ================= VIDEO PLAYER ================= */
  const player = useVideoPlayer(videoUrl || "", (instance) => {
    instance.play();
  });

  /* ================= TRACK PROGRESS ================= */
  useEffect(() => {
    if (!player) return;

    let last = 0;

    const interval = setInterval(async () => {
      try {
        if (!player?.duration || player.duration === 0) return;

        const percent = (player.currentTime / player.duration) * 100;

        setProgress(percent / 100);

        // Send update every 5%
        if (percent - last >= 5) {
          last = percent;

          const res = await api.post(`/student/lessons/${lessonId}/progress`, {
            watchPercentage: Math.floor(percent),
          });

          // ✅ NEVER RESET COMPLETED (backend already protects)
          if (res.data.lessonCompleted) {
            setCompleted(true);
          }
        }
      } catch (err: any) {
        console.log("❌ Progress error:", err?.response?.data || err.message);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [player]);

  /* ================= NEXT LESSON ================= */
  const goToNextLesson = () => {
    if (currentIndex === -1) return;

    const nextLesson = lessons[currentIndex + 1];

    if (nextLesson) {
      router.replace(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* 🎥 VIDEO */}
      <View style={{ height: width * 0.56 }} className="bg-black">
        {videoUrl ? (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            nativeControls
          />
        ) : (
          <Text className="text-white text-center mt-10">Loading video...</Text>
        )}
      </View>

      {/* 📊 CONTENT */}
      <View className="flex-1 p-6">
        <Text className="text-xl font-bold text-textPrimary mb-2">Lesson</Text>

        {/* Progress Bar */}
        <View className="h-2 bg-border rounded-full mb-4 overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        {completed ? (
          <View className="flex-row items-center mb-6">
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text className="ml-2 text-success font-semibold">
              Lesson Completed
            </Text>
          </View>
        ) : (
          <Text className="text-textSecondary mb-6">
            Watch 90% to complete this lesson
          </Text>
        )}

        {/* Next Button */}
        <TouchableOpacity
          disabled={!completed}
          onPress={goToNextLesson}
          className={`py-3 rounded-xl ${
            completed ? "bg-primary" : "bg-primaryLight/50"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              completed ? "text-white" : "text-textSecondary"
            }`}
          >
            Next Lesson
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
