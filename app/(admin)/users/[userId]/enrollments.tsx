import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function EnrollmentsScreen() {
  const { userId } = useLocalSearchParams();
  const id = Array.isArray(userId) ? userId[0] : userId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [type, setType] = useState<"student" | "teacher" | "admin">("student");

  const fetchData = async () => {
    try {
      const userRes = await api.get("/admin/users");
      const foundUser = userRes.data.find((u: any) => u._id === id);

      if (!foundUser) return;

      setUser(foundUser);
      setType(foundUser.role);

      if (foundUser.role === "student") {
        const res = await api.get(`/admin/user-enrollment-view/${id}`);

        const cleanData = (res.data.enrollments || []).filter(
          (item: any) => item.courseTitle, // ✅ only valid courses
        );

        setData(cleanData);
      } else if (foundUser.role === "teacher") {
        const res = await api.get(`/admin/user-enrollment-view/${id}`);
        setData(res.data.teacherCourses || []);
      } else {
        setData([]);
      }
    } catch (err: any) {
      console.log("❌ Error:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!data.length) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background px-8">
        <Ionicons name="layers-outline" size={50} color="#9CA3AF" />
        <Text className="text-textPrimary mt-4 text-lg font-semibold">
          No Records Found
        </Text>
        <Text className="text-textSecondary text-sm mt-1 text-center">
          {type === "teacher"
            ? "This teacher has not created any courses yet"
            : "This user is not enrolled in any course"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      {/* ================= HEADER (IMPROVED) ================= */}
      <View className="bg-primary/10 border-b border-border px-5 pt-10 pb-6 rounded-b-3xl">
        <View className="flex-row items-center">
          <View className="bg-primary p-3 rounded-2xl">
            <Ionicons
              name={type === "teacher" ? "school-outline" : "person-outline"}
              size={22}
              color="#fff"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-textPrimary">
              {type === "teacher" ? "Teacher Courses" : "Student Enrollments"}
            </Text>

            <Text className="text-textSecondary text-sm mt-1">
              {user?.name} • {type.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= LIST ================= */}
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="bg-surface border border-border rounded-2xl p-5 mb-4">
            {/* TITLE */}
            <Text className="text-textPrimary font-semibold text-lg">
              {item.courseTitle || item.title}
            </Text>

            {/* TEACHER VIEW */}
            {type === "teacher" && (
              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="people" size={16} color="#4F46E5" />
                  <Text className="text-primary ml-2 text-sm">Students</Text>
                </View>

                <Text className="text-textPrimary font-semibold">
                  {item.students || 0}
                </Text>
              </View>
            )}

            {/* STUDENT VIEW */}
            {type === "student" && (
              <View className="mt-3">
                <Text className="text-green-600 text-sm font-semibold">
                  {item.status}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  Instructor: {item.teacherName}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  Enrolled Course
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
