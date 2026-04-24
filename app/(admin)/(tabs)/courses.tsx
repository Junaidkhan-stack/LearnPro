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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  /* ================= FETCH ================= */
  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (err) {
      console.log("Courses error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();

    const interval = setInterval(() => {
      fetchCourses();
    }, 5000); // auto refresh every 5 sec

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-3">Loading courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="px-5 pt-6 pb-3">
        <Text className="text-3xl font-bold text-textPrimary">
          Course Review Center
        </Text>
        <Text className="text-textSecondary mt-1">
          Review and manage submitted courses
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const isDeleted = item.isDeleted === true;
          const isRejected = item.status === "rejected";

          return (
            <Pressable
              disabled={isDeleted}
              onPress={() =>
                router.push({
                  pathname: "/(admin)/courses/[courseId]",
                  params: { courseId: item._id },
                })
              }
              className="bg-surface border border-border rounded-2xl p-5 mb-4"
            >
              {/* TOP ROW */}
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-3">
                  {/* TITLE */}
                  <Text
                    className="text-textPrimary font-bold text-lg"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  {/* INSTRUCTOR */}
                  <Text className="text-textSecondary text-xs mt-1">
                    Instructor: {item.teacher?.name || "Unknown"}
                  </Text>
                </View>

                {/* STATUS BADGE */}
                <View
                  className={`px-3 py-1 rounded-full ${
                    isDeleted
                      ? "bg-gray-200"
                      : item.status === "approved"
                        ? "bg-green-100"
                        : item.status === "rejected"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isDeleted
                        ? "text-gray-600"
                        : item.status === "approved"
                          ? "text-green-600"
                          : item.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {isDeleted
                      ? "DELETED"
                      : item.status?.toUpperCase() || "PENDING"}
                  </Text>
                </View>
              </View>

              {/* CREATED DATE (IMPROVED UI) */}
              <View className="flex-row items-center mt-3 bg-primary/5 px-3 py-2 rounded-xl">
                <Ionicons name="time-outline" size={14} color="#4F46E5" />
                <Text className="text-textSecondary text-xs ml-2">
                  {item.createdAt ? getRelativeTime(item.createdAt) : "N/A"}
                </Text>
              </View>

              {/* REJECTED MESSAGE */}
              {!isDeleted && isRejected && (
                <View className="mt-3 bg-red-50 px-3 py-2 rounded-xl">
                  <Text className="text-red-600 text-xs font-medium">
                    ⛔ This course was rejected. Needs admin review.
                  </Text>
                </View>
              )}

              {/* DELETED MESSAGE */}
              {isDeleted && (
                <View className="mt-3 bg-gray-100 px-3 py-2 rounded-xl">
                  <Text className="text-gray-600 text-xs font-medium">
                    ⚠️ This course has been removed and is no longer accessible.
                  </Text>
                </View>
              )}

              {/* FOOTER */}
              <View className="flex-row justify-between items-center mt-4">
                <Text
                  className={`text-xs ${
                    isDeleted ? "text-gray-500" : "text-primaryLight"
                  }`}
                >
                  {isDeleted ? "Locked" : "Tap to review"}
                </Text>

                {!isDeleted && (
                  <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
