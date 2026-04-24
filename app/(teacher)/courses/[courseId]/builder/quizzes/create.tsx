import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function CreateQuiz() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(""); // ✅ FIX: string not Date

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      marks: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);

  /* ================= ADD QUESTION ================= */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        marks: 1,
      },
    ]);
  };

  const updateQuestion = (i: number, value: string) => {
    const updated = [...questions];
    updated[i].question = value;
    setQuestions(updated);
  };

  const updateOption = (q: number, o: number, value: string) => {
    const updated = [...questions];
    updated[q].options[o] = value;
    setQuestions(updated);
  };

  const setCorrect = (q: number, value: string) => {
    const updated = [...questions];
    updated[q].correctIndex = Number(value) - 1;
    setQuestions(updated);
  };

  const setMarks = (q: number, value: string) => {
    const updated = [...questions];
    updated[q].marks = Number(value);
    setQuestions(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!title.trim()) {
      return Alert.alert("Error", "Enter quiz title");
    }

    if (!deadline.trim()) {
      return Alert.alert("Error", "Enter deadline");
    }

    try {
      setLoading(true);

      const totalMarks = questions.reduce(
        (sum, q) => sum + Number(q.marks || 0),
        0
      );

      // ✅ FIX: safe date conversion
      const parsedDeadline = new Date(deadline);

      if (isNaN(parsedDeadline.getTime())) {
        Alert.alert("Error", "Invalid deadline format");
        return;
      }

      const createRes = await api.post("/quizzes/create", {
        courseId,
        title,
        totalMarks,
        timeLimit: 30,
        deadline: parsedDeadline.toISOString(), // ✅ FIXED
      });

      const quizId = createRes.data.quiz._id;

      await api.post(`/quizzes/add-questions/${quizId}`, {
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctIndex,
        })),
      });

      Alert.alert("Success", "Quiz created");
      router.back();
    } catch (err: any) {
      console.log(err?.response?.data);
      Alert.alert("Error", "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        <Text className="text-3xl font-bold text-textPrimary mb-2">
          Create Quiz
        </Text>

        <Text className="text-textSecondary mb-6">
          Build questions and set deadline
        </Text>

        {/* TITLE */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Quiz Title"
          className="bg-surface p-4 rounded-xl border border-border mb-4 text-textPrimary"
        />

        {/* DEADLINE */}
        <View className="bg-surface p-4 rounded-xl border border-border mb-6">
          <Text className="text-textSecondary text-xs mb-2">
            Deadline (YYYY-MM-DD)
          </Text>

          <TextInput
            value={deadline}
            onChangeText={setDeadline}
            className="text-textPrimary"
          />
        </View>

        {/* QUESTIONS */}
        {questions.map((q, i) => (
          <View
            key={i}
            className="bg-surface p-4 rounded-2xl mb-5 border border-border"
          >
            <Text className="text-textPrimary font-semibold mb-2">
              Question {i + 1}
            </Text>

            <TextInput
              value={q.question}
              onChangeText={(v) => updateQuestion(i, v)}
              placeholder="Enter question"
              className="bg-background p-3 rounded-xl border border-border mb-3 text-textPrimary"
            />

            {q.options.map((opt, j) => (
              <TextInput
                key={j}
                value={opt}
                onChangeText={(v) => updateOption(i, j, v)}
                placeholder={`Option ${j + 1}`}
                className="bg-background p-3 rounded-xl border border-border mb-2 text-textPrimary"
              />
            ))}

            <TextInput
              placeholder="Correct answer (1-4)"
              keyboardType="numeric"
              onChangeText={(v) => setCorrect(i, v)}
              className="bg-background p-3 rounded-xl border border-border mt-2"
            />

            <TextInput
              value={String(q.marks)}
              onChangeText={(v) => setMarks(i, v)}
              keyboardType="numeric"
              placeholder="Marks"
              className="bg-background p-3 rounded-xl border border-border mt-2"
            />
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

        {/* SUBMIT */}
        <Pressable
          onPress={handleSubmit}
          className={`p-4 rounded-2xl ${
            loading ? "bg-gray-400" : "bg-primary"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Creating..." : "Publish Quiz"}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}