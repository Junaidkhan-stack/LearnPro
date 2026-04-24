import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "@/services/api";

type Course = {
  id: string;
  title: string;
  instructor: string;
  enrolled: boolean;
};

export default function CoursesScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  /* ================= FETCH COURSES ================= */
  const fetchCourses = async () => {
    try {
      const res = await api.get("/student/courses");
      setCourses(res.data);
    } catch (error) {
      console.log("Fetch courses error:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ================= ENROLL ================= */
  const enrollCourse = async (id: string) => {
    try {
      await api.post(`/student/courses/${id}/enroll`);
      fetchCourses();
    } catch (error: any) {
      console.log(error?.response?.data || error.message);
    }
  };

  /* ================= SEARCH ================= */
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledCourses = filteredCourses.filter((c) => c.enrolled);
  const availableCourses = filteredCourses.filter((c) => !c.enrolled);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH */}
        <View className="bg-surface px-4 py-3 rounded-2xl border border-border mb-6 flex-row items-center">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search courses..."
            value={search}
            onChangeText={setSearch}
            className="ml-2 flex-1 text-textPrimary"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* EMPTY SEARCH */}
        {search.trim().length > 0 && filteredCourses.length === 0 && (
          <Text className="text-center text-textSecondary mt-10">
            No courses found
          </Text>
        )}

        {/* ================= ENROLLED ================= */}
        {enrolledCourses.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-textPrimary mb-3">
              Enrolled Courses
            </Text>

            {enrolledCourses.map((item) => (
              <View
                key={item.id}
                className="bg-surface p-5 rounded-2xl border border-border mb-4"
              >
                <Text className="text-lg font-semibold text-textPrimary">
                  {item.title}
                </Text>

                <Text className="text-textSecondary text-sm mt-1 mb-4">
                  Instructor: {item.instructor}
                </Text>

                {/* 🔵 PRIMARY BUTTON */}
                <Pressable
                  onPress={() => router.push(`/course/${item.id}`)}
                  className="bg-indigo-600 py-3 rounded-xl active:opacity-80 shadow-sm"
                >
                  <Text className="text-white text-center font-semibold">
                    Continue Learning
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ================= AVAILABLE ================= */}
        {availableCourses.length > 0 && (
          <View>
            <Text className="text-lg font-bold text-textPrimary mb-3">
              Available Courses
            </Text>

            {availableCourses.map((item) => (
              <View
                key={item.id}
                className="bg-surface p-5 rounded-2xl border border-border mb-4"
              >
                <Text className="text-lg font-semibold text-textPrimary">
                  {item.title}
                </Text>

                <Text className="text-textSecondary text-sm mt-1 mb-4">
                  Instructor: {item.instructor}
                </Text>

                {/* 🟢 OUTLINED PREMIUM BUTTON */}
                <Pressable
                  onPress={() => enrollCourse(item.id)}
                  className="bg-green-50 border border-green-500 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-green-700 text-center font-semibold">
                    Enroll Now
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}