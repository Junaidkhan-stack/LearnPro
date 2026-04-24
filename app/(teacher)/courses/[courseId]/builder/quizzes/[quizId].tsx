import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function QuizDetail() {
  const { quizId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);

  /* ================= FETCH ================= */
  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);

      setTitle(res.data.title);
      setDeadline(res.data.deadline ? res.data.deadline.split("T")[0] : "");
      setQuestions(res.data.questions || []);
    } catch (err: any) {
      console.log("FETCH ERROR:", err?.response?.data);
      Alert.alert("Error", "Failed to load quiz");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  /* ================= HELPERS ================= */
  const updateQuestionText = (i: number, value: string) => {
    const updated = [...questions];
    updated[i].question = value;
    setQuestions(updated);
  };

  const updateOption = (q: number, o: number, value: string) => {
    const updated = [...questions];
    updated[q].options[o] = value;
    setQuestions(updated);
  };

  const setCorrect = (q: number, index: number) => {
    const updated = [...questions];
    updated[q].correctAnswer = index;
    setQuestions(updated);
  };

  const setMarks = (q: number, value: string) => {
    const updated = [...questions];
    updated[q].marks = Number(value);
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
      },
    ]);
  };

  /* ================= TOTAL MARKS ================= */
  const totalMarks = questions.reduce(
    (sum, q) => sum + Number(q.marks || 0),
    0,
  );

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      await api.put(`/quizzes/${quizId}`, {
        title,
        deadline,
      });

      await api.put(`/quizzes/${quizId}/questions`, {
        questions,
      });

      Alert.alert("Success", "Quiz updated successfully");
    } catch (err: any) {
      console.log("UPDATE ERROR:", err?.response?.data);
      Alert.alert("Error", err?.response?.data?.message || "Update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = () => {
    Alert.alert("Delete Quiz", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/quizzes/${quizId}`);
          router.back();
        },
      },
    ]);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* HEADER */}
        <Text className="text-2xl font-bold text-textPrimary mb-4">
          Edit Quiz
        </Text>

        {/* TITLE */}
        <View className="bg-surface p-4 rounded-2xl border border-border mb-4">
          <Text className="text-textSecondary text-xs mb-1">Quiz Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="text-textPrimary text-lg font-semibold"
          />
        </View>

        {/* DEADLINE */}
        <View className="bg-surface p-4 rounded-2xl border border-border mb-4">
          <Text className="text-textSecondary text-xs mb-1">
            Deadline (YYYY-MM-DD)
          </Text>
          <TextInput
            value={deadline}
            onChangeText={setDeadline}
            placeholder="2026-05-01"
            className="text-textPrimary"
          />
        </View>

        {/* QUESTIONS */}
        {questions.map((q, i) => (
          <View
            key={i}
            className="bg-surface p-4 rounded-2xl border border-border mb-5"
          >
            <Text className="text-textPrimary font-semibold mb-3">
              Question {i + 1}
            </Text>

            {/* QUESTION TEXT */}
            <TextInput
              value={q.question}
              onChangeText={(v) => updateQuestionText(i, v)}
              placeholder="Enter question"
              className="bg-background p-3 rounded-xl border border-border mb-3 text-textPrimary"
            />

            {/* OPTIONS */}
            {q.options.map((opt: string, j: number) => (
              <Pressable
                key={j}
                onPress={() => setCorrect(i, j)}
                className={`p-3 rounded-xl mb-2 border ${
                  q.correctAnswer === j
                    ? "border-success bg-success/10"
                    : "border-border bg-background"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={
                      q.correctAnswer === j
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={18}
                    color={q.correctAnswer === j ? "#22c55e" : "#9ca3af"}
                  />

                  <TextInput
                    value={opt}
                    onChangeText={(v) => updateOption(i, j, v)}
                    className="ml-2 flex-1 text-textPrimary"
                  />
                </View>
              </Pressable>
            ))}

            {/* MARKS */}
            <View className="mt-3">
              <Text className="text-xs text-textSecondary mb-1">
                Marks for this question
              </Text>

              <TextInput
                value={String(q.marks || 1)}
                onChangeText={(v) => setMarks(i, v)}
                keyboardType="numeric"
                placeholder="Enter marks (e.g. 5)"
                className="bg-background px-3 py-3 rounded-xl border border-border text-textPrimary"
              />
            </View>
          </View>
        ))}

        {/* ADD QUESTION */}
        <Pressable
          onPress={addQuestion}
          className="bg-primary/10 p-4 rounded-xl mb-5 flex-row items-center justify-center"
        >
          <Ionicons name="add" size={18} color="#4F46E5" />
          <Text className="text-primary ml-2">Add Question</Text>
        </Pressable>

        {/* SAVE */}
        <Pressable
          onPress={handleSave}
          className="bg-primary p-4 rounded-2xl mb-3"
        >
          <Text className="text-white text-center font-semibold">
            Save Changes
          </Text>
        </Pressable>

        {/* DELETE */}
        <Pressable onPress={handleDelete} className="bg-danger p-4 rounded-2xl">
          <Text className="text-white text-center">Delete Quiz</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
