import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { api } from "@/services/api";

export default function QuizList() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const [quizzes, setQuizzes] = useState<any[]>([]);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/quizzes/course/${courseId}`);
      setQuizzes(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (courseId) fetchQuizzes();
    }, [courseId])
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-textPrimary">
              Quizzes
            </Text>
            <Text className="text-textSecondary">
              Manage quizzes
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push(
                `/(teacher)/courses/${courseId}/builder/quizzes/create`
              )
            }
            className="bg-primary px-4 py-3 rounded-2xl"
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* LIST */}
        {quizzes.map((quiz) => (
          <Pressable
            key={quiz._id}
            onPress={() =>
              router.push(
                `/(teacher)/courses/${courseId}/builder/quizzes/${quiz._id}`
              )
            }
            className="bg-surface p-5 rounded-3xl mb-4 border border-border"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center">
                <Ionicons name="help-circle" size={20} color="#4F46E5" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-textPrimary font-semibold">
                  {quiz.title}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  {quiz.questions?.length || 0} Questions • {quiz.totalMarks} Marks
                </Text>

                {quiz.deadline && (
                  <Text className="text-red-500 text-xs mt-1">
                    Deadline: {new Date(quiz.deadline).toDateString()}
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}