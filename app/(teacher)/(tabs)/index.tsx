import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function TeacherDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState([
    { title: "Courses", value: 0, icon: "book-outline", color: "#4F46E5" },
    { title: "Students", value: 0, icon: "people-outline", color: "#0EA5E9" },
    { title: "Quizzes", value: 0, icon: "help-circle-outline", color: "#F59E0B" },
  ]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/teacher");

      setStats([
        {
          title: "Courses",
          value: res.data?.totalCourses || 0,
          icon: "book-outline",
          color: "#4F46E5",
        },
        {
          title: "Students",
          value: res.data?.totalStudents || 0,
          icon: "people-outline",
          color: "#0EA5E9",
        },
        {
          title: "Quizzes",
          value: res.data?.totalQuizzes || 0,
          icon: "help-circle-outline",
          color: "#F59E0B",
        },
      ]);
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

const actions = [
  {
    title: "Create Course",
    subtitle: "Build new course",
    icon: "book-outline",
    route: "/(teacher)/createCourse",
    color: "#4F46E5",
  },
  {
    title: "My Courses",
    subtitle: "Manage courses",
    icon: "library-outline",
    route: "/(teacher)/courses",
    color: "#6366F1",
  },
];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-5 pt-6">

        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-textPrimary text-3xl font-bold">
            Teacher Dashboard
          </Text>

          <Text className="text-textSecondary mt-1">
            Manage your learning platform
          </Text>
        </View>

        {/* STATS */}
        <View className="flex-row justify-between mb-6">
          {stats.map((item, index) => (
            <View
              key={index}
              className="bg-surface flex-1 mx-1 p-4 rounded-2xl border border-border"
            >
              <View
                style={{ backgroundColor: item.color + "20" }}
                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.color}
                />
              </View>

              <Text className="text-textPrimary text-xl font-bold">
                {item.value}
              </Text>

              <Text className="text-textSecondary text-xs mt-1">
                {item.title}
              </Text>
            </View>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <Text className="text-textPrimary text-xl font-bold mb-4">
          Quick Actions
        </Text>

        <Text className="text-textSecondary text-sm mb-4">
          Create and manage your content
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {actions.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(item.route as any)}
              className="w-[48%] bg-surface p-4 rounded-2xl mb-4 border border-border active:scale-[0.96]"
            >
              <View
                style={{ backgroundColor: item.color + "15" }}
                className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
              </View>

              <Text className="text-textPrimary font-semibold text-sm">
                {item.title}
              </Text>

              <Text className="text-textSecondary text-xs mt-1">
                {item.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}