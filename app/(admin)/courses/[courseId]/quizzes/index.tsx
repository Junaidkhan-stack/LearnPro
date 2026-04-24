import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function QuizzesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH QUIZZES ================= */
  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/admin/courses/${courseId}/quizzes`);
      setQuizzes(res.data);
    } catch (err) {
      console.log("Quiz error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">
          Loading quizzes...
        </Text>
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
        <View className="mb-6">
          <Text className="text-2xl font-bold text-textPrimary">
            Course Quizzes
          </Text>
          <Text className="text-textSecondary">
            Review quiz structure and questions
          </Text>
        </View>

        {/* EMPTY STATE */}
        {quizzes.length === 0 && (
          <View className="items-center mt-16">
            <Ionicons name="help-circle-outline" size={50} color="#9CA3AF" />
            <Text className="text-textPrimary font-semibold mt-3 text-lg">
              No quizzes found
            </Text>
            <Text className="text-textSecondary text-center mt-1">
              This course has no quizzes yet
            </Text>
          </View>
        )}

        {/* QUIZ LIST */}
        {quizzes.map((quiz, index) => (
          <Pressable
            key={quiz._id}
            onPress={() =>
              router.push({
                pathname: "/(admin)/courses/[courseId]/quizzes/[quizId]",
                params: {
                  courseId,
                  quizId: quiz._id,
                },
              })
            }
            className="bg-surface border border-border rounded-2xl p-5 mb-4"
          >
            {/* TOP */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text className="text-textPrimary font-semibold text-lg">
                  {index + 1}. {quiz.title}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  Quiz
                </Text>
              </View>

              <View className="bg-indigo-50 p-2 rounded-full">
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#4F46E5"
                />
              </View>
            </View>

            {/* SEPARATOR */}
            <View className="h-[1px] bg-border my-3 opacity-60" />

            {/* FOOTER */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                {/* QUESTIONS COUNT */}
                <Text className="text-textSecondary text-xs">
                  Questions: {quiz.questions?.length || 0}
                </Text>

                {/* DEADLINE */}
                <Text className="text-xs text-danger">
                  {quiz.deadline
                    ? `Due: ${new Date(quiz.deadline).toLocaleDateString()}`
                    : "No Deadline"}
                </Text>
              </View>

              <View className="bg-indigo-50 px-2 py-1 rounded-md">
                <Text className="text-indigo-600 text-xs font-medium">
                  Open
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}