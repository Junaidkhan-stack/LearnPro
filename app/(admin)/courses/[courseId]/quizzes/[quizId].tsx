import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function QuizDetail() {
  const params = useLocalSearchParams();

  const quizId = Array.isArray(params.quizId)
    ? params.quizId[0]
    : params.quizId;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/admin/quizzes/${quizId}`);
      setQuiz(res.data);
    } catch (err) {
      console.log("Quiz detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <Text className="text-textPrimary">Quiz not found</Text>
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
          <Text className="text-3xl font-bold text-textPrimary">
            Quiz Review
          </Text>
          <Text className="text-textSecondary mt-1">
            Admin inspection panel
          </Text>
        </View>

        {/* STATS GRID (THEMED LIGHT) */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {[
            { label: "Time Limit", value: `${quiz.timeLimit}s` },
            { label: "Total Marks", value: quiz.totalMarks },
            { label: "Max Attempts", value: quiz.maxAttempts },
            { label: "Questions", value: quiz.questions?.length || 0 },
          ].map((item, i) => (
            <View
              key={i}
              className="w-[48%] mb-3 bg-primary/5 border border-primary/10 rounded-xl p-4"
            >
              <Text className="text-textSecondary text-xs font-medium">
                {item.label}
              </Text>

              <Text className="text-textPrimary font-bold text-lg mt-1">
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* QUESTIONS */}
        <View className="mb-4">
          <Text className="text-textPrimary font-bold text-lg mb-3">
            Questions Preview
          </Text>

          {quiz.questions?.map((q: any, index: number) => (
            <View
              key={index}
              className="bg-surface border border-border rounded-2xl p-4 mb-4"
            >
              {/* HEADER */}
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-textPrimary font-semibold flex-1 pr-2">
                  {index + 1}. {q.question}
                </Text>

                <View className="bg-primary/10 px-2.5 py-1 rounded-md">
                  <Text className="text-primary text-xs font-semibold">
                    Q{index + 1}
                  </Text>
                </View>
              </View>

              {/* OPTIONS */}
              <View>
                {q.options?.map((opt: string, i: number) => {
                  const isCorrect = q.correctAnswer === i;

                  return (
                    <View
                      key={i}
                      className={`flex-row items-center p-2 rounded-lg mb-2 ${
                        isCorrect ? "bg-primary/10" : ""
                      }`}
                    >
                      <Ionicons
                        name={
                          isCorrect ? "checkmark-circle" : "ellipse-outline"
                        }
                        size={18}
                        color={isCorrect ? "#4F46E5" : "#9CA3AF"}
                      />

                      <Text
                        className={`ml-2 text-sm ${
                          isCorrect
                            ? "text-textPrimary font-semibold"
                            : "text-textSecondary"
                        }`}
                      >
                        {opt}
                      </Text>

                      {isCorrect && (
                        <Text className="ml-auto text-primary text-xs font-semibold">
                          Correct
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* FOOTER NOTE */}
        {/* FOOTER NOTE */}
        <View className="bg-primary/10 border border-primary/20 p-4 rounded-2xl">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle-outline" size={18} color="#4F46E5" />

            <Text className="text-textPrimary text-xs ml-2 flex-1 leading-5">
              Admin-only preview mode — correct answers are visible for review
              only.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
