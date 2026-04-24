import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function CourseHome() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);

  const menuItems = [
    { label: "Lessons", route: "lessons", icon: "book-outline" },
    { label: "Quiz", route: "quiz", icon: "help-circle-outline" },
    { label: "Assignment", route: "assignments", icon: "document-text-outline" },
    { label: "Progress", route: "progress", icon: "stats-chart-outline" },
  ];

  const fetchCourse = async () => {
    try {
      const res = await api.get("/student/courses");
      const found = res.data.find((c: any) => c._id === courseId);
      setCourse(found);
    } catch (error) {
      console.log("Course fetch error:", error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background px-5 pt-2">

      {/* SIMPLE TITLE (NO CARD, NO BACKGROUND) */}
      {course && (
        <View className="pt-3 pb-4">
          <Text className="text-textPrimary text-lg font-bold">
            {course.title}
          </Text>

          <Text className="text-textSecondary text-xs mt-1">
            Choose what you want to continue
          </Text>
        </View>
      )}

      {/* MENU */}
      <View className="pt-2">
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={() =>
              router.push(`/course/${courseId}/${item.route}`)
            }
            className="bg-surface p-5 rounded-2xl border border-border mb-4 flex-row justify-between items-center"
            android_ripple={{ color: "#E5E7EB" }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            {/* LEFT SIDE */}
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color="#4F46E5"
                />
              </View>

              <Text className="text-textPrimary font-semibold text-base">
                {item.label}
              </Text>
            </View>

            {/* ARROW */}
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#6B7280"
            />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}