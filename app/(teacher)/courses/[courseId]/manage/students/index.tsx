import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

type Student = {
  _id: string;
  name: string;
  email: string;
};

export default function StudentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchStudents = async () => {
    try {
      console.log("📡 FETCH STUDENTS START");
      console.log("courseId:", courseId);

      const res = await api.get(`/courses/${courseId}/enrollments`);

      console.log("✅ STUDENTS:", res.data);

      const cleanData = (res.data || []).filter(
        (s: any) => s && s._id
      );

      setStudents(cleanData);
    } catch (error: any) {
      console.log("❌ Failed to load students");
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
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
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="mb-5">
          <Text className="text-3xl font-bold text-textPrimary">
            Students
          </Text>
          <Text className="text-textSecondary mt-1">
            Manage enrolled students
          </Text>
        </View>

        {/* LIST */}
        {students.map((student) => (
          <Pressable
            key={student._id}
            onPress={() =>
              router.push({
                pathname:
                  "/(teacher)/courses/[courseId]/manage/students/[studentId]",
                params: {
                  courseId: courseId as string,
                  studentId: student._id,
                },
              })
            }
            className="bg-surface p-4 rounded-2xl mb-4 border border-border"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Ionicons name="person" size={22} color="#4F46E5" />
              </View>

              <View className="flex-1">
                <Text className="text-textPrimary font-semibold">
                  {student.name}
                </Text>
                <Text className="text-textSecondary text-sm">
                  {student.email}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}

        {/* EMPTY */}
        {students.length === 0 && (
          <View className="mt-20 items-center">
            <Ionicons name="people-outline" size={40} color="#9CA3AF" />
            <Text className="text-textSecondary mt-3">
              No students enrolled yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}