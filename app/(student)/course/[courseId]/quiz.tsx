import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";

export default function QuizScreen() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/quizzes/course/${courseId}`);
      setQuizzes(res.data || []);
    } catch (error: any) {
      console.log(error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQuizzes();
    }, []),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-textSecondary mt-2">Loading quizzes...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-5 pt-5">
      
      {/* HEADER */}
      <Text className="text-textPrimary text-2xl font-bold mb-5">
        Quizzes
      </Text>

      {quizzes.map((quiz) => {
        const isCompleted = quiz.isCompleted;

        const deadline = quiz.deadline || quiz.dueDate;

        const isExpired =
          deadline && new Date(deadline) < new Date();

        return (
          <View
            key={quiz._id}
            className="bg-surface p-5 mb-4 rounded-2xl border border-border"
          >
            {/* TITLE */}
            <Text className="text-textPrimary font-bold text-lg">
              {quiz.title}
            </Text>

            {/* DEADLINE (NEW FIX) */}
            {deadline && (
              <Text className="text-textSecondary text-xs mt-2">
                Deadline:{" "}
                {new Date(deadline).toLocaleDateString()}
              </Text>
            )}

            {/* STATUS BADGE */}
            <View className="mt-3">
              {isCompleted ? (
                <View className="bg-green-100 p-3 rounded-xl">
                  <Text className="text-green-700 text-center font-semibold">
                    ✅ Completed
                  </Text>

                  <Text className="text-center text-textSecondary mt-1">
                    Score: {quiz.lastScore || 0} / {quiz.totalMarks || 100}
                  </Text>
                </View>
              ) : isExpired ? (
                <View className="bg-red-100 p-3 rounded-xl">
                  <Text className="text-red-700 text-center font-semibold">
                    ❌ Deadline Passed
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  className="bg-primary p-3 rounded-xl"
                  onPress={() =>
                    router.push(
                      `/course/${courseId}/play?quizId=${quiz._id}`,
                    )
                  }
                >
                  <Text className="text-white text-center font-semibold">
                    Start Quiz
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      {quizzes.length === 0 && (
        <Text className="text-textSecondary text-center mt-10">
          No quizzes available
        </Text>
      )}
    </ScrollView>
  );
}