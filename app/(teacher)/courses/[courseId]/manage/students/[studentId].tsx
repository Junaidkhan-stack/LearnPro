import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

export default function StudentDetail() {
  const params = useLocalSearchParams();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const studentId = Array.isArray(params.studentId)
    ? params.studentId[0]
    : params.studentId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const res = await api.get(
        `/enrollment/courses/${courseId}/students/${studentId}`,
      );

      setData(res.data);

      console.log("✅ Student details loaded");
    } catch (error: any) {
      console.log("❌ Failed to load student details");
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!data) return null;

return (
  <SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* ================= HEADER + PROFILE + OVERALL ================= */}
      <View className="bg-surface p-5 rounded-2xl mb-6 border border-border">

        {/* PROFILE ROW */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
            <Ionicons name="person" size={32} color="#4F46E5" />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-textPrimary font-bold text-lg">
              {data.name}
            </Text>
            <Text className="text-textSecondary text-sm">
              {data.email}
            </Text>
          </View>
        </View>

        {/* OVERALL PROGRESS */}
        <View className="bg-background p-4 rounded-xl border border-border">

          <Text className="text-textPrimary font-semibold mb-3">
            Overall Progress
          </Text>

          {/* Video */}
          <View className="flex-row justify-between mb-2">
            <Text className="text-textSecondary text-sm">Video</Text>
            <Text className="text-primary text-sm font-semibold">
              {Math.round(data.progress?.video || 0)}%
            </Text>
          </View>

          {/* Quiz */}
          <View className="flex-row justify-between mb-2">
            <Text className="text-textSecondary text-sm">Quiz</Text>
            <Text className="text-primary text-sm font-semibold">
              {Math.round(data.progress?.quiz || 0)}%
            </Text>
          </View>

          {/* Assignment */}
          <View className="flex-row justify-between mb-2">
            <Text className="text-textSecondary text-sm">Assignments</Text>
            <Text className="text-primary text-sm font-semibold">
              {Math.round(data.progress?.assignment || 0)}%
            </Text>
          </View>

          {/* TOTAL */}
          <View className="flex-row justify-between mt-3 pt-3 border-t border-border">
            <Text className="text-textPrimary font-bold">
              Total
            </Text>
            <Text className="text-primary font-bold">
              {Math.round(data.progress?.overall || 0)}%
            </Text>
          </View>

        </View>
      </View>

      {/* ================= LESSONS ================= */}
      <View className="bg-surface p-5 rounded-2xl mb-5 border border-border">
        <Text className="text-textPrimary font-semibold mb-4">
          Lessons Progress
        </Text>

        {data.lessons?.length > 0 ? (
          data.lessons.map((l: any) => (
            <View
              key={l._id}
              className="flex-row justify-between items-center mb-3"
            >
              <Text className="text-textPrimary text-sm flex-1 pr-2">
                {l.title}
              </Text>

              <View className="px-3 py-1 rounded-full bg-primary/10">
                <Text className="text-primary text-xs font-semibold">
                  {Math.round(l.watchPercentage || 0)}%
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-textSecondary">No lessons yet</Text>
        )}
      </View>

      {/* ================= ASSIGNMENTS ================= */}
      <View className="bg-surface p-5 rounded-2xl mb-5 border border-border">
        <Text className="text-textPrimary font-semibold mb-4">
          Assignments
        </Text>

        {data.assignments?.length > 0 ? (
          data.assignments.map((a: any) => (
            <View
              key={a._id}
              className="flex-row justify-between items-center mb-3"
            >
              <Text className="text-textPrimary text-sm flex-1 pr-2">
                {a.title}
              </Text>

              <View
                className={`px-3 py-1 rounded-full ${
                  a.submission?.graded
                    ? "bg-primary/10"
                    : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    a.submission?.graded
                      ? "text-primary"
                      : "text-yellow-700"
                  }`}
                >
                  {a.submission?.graded
                    ? `${Math.round(a.submission.marks || 0)}/${Math.round(
                        a.totalMarks || 0
                      )}`
                    : "Not graded"}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-textSecondary">No assignments yet</Text>
        )}
      </View>

      {/* ================= QUIZZES ================= */}
      <View className="bg-surface p-5 rounded-2xl border border-border">
        <Text className="text-textPrimary font-semibold mb-4">
          Quizzes Performance
        </Text>

        {data.quizzes?.length > 0 ? (
          data.quizzes.map((q: any) => (
            <View
              key={q._id}
              className="flex-row justify-between items-center mb-3"
            >
              <Text className="text-textPrimary text-sm flex-1 pr-2">
                {q.title}
              </Text>

              <View className="px-3 py-1 rounded-full bg-primary/10">
                <Text className="text-primary text-xs font-semibold">
                  {Math.round(q.score || 0)}/{Math.round(q.total || 0)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-textSecondary">No quizzes attempted</Text>
        )}
      </View>

    </ScrollView>
  </SafeAreaView>
);
}
