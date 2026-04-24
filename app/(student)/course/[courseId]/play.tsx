import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";

export default function QuizPlayer() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const quizId =
    typeof params.quizId === "string"
      ? params.quizId
      : params.quizId?.[0];

  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : params.courseId?.[0];

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const submittedRef = useRef(false);

  /* ================= START QUIZ ================= */
  const startQuiz = async () => {
    try {
      console.log("🚀 Starting quiz:", quizId, courseId);

      const res = await api.post(`/quizzes/start/${quizId}`);

      console.log("✅ Quiz started:", res.data);

      setQuestions(res.data.questions || []);
      setAttemptId(res.data.attemptId || "");
      setTimeLeft(res.data.timeLimit || 0);

    } catch (error: any) {
      console.log("❌ Start quiz error:", error?.response?.data);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to start quiz"
      );

      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startQuiz();
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ================= AUTO SUBMIT ================= */
  useEffect(() => {
    if (timeLeft === 0 && questions.length && !submittedRef.current) {
      handleSubmit();
    }
  }, [timeLeft]);

  /* ================= AUTO SUBMIT ON EXIT ================= */
  useEffect(() => {
    return () => {
      if (!submittedRef.current && attemptId) {
        handleSubmit();
      }
    };
  }, [attemptId]);

  /* ================= NEXT ================= */
  const handleNext = () => {
    const updatedAnswers = [
      ...answers,
      { questionIndex: current, selectedOption: selected },
    ];

    setAnswers(updatedAnswers);
    setSelected(null);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      handleSubmit(updatedAnswers);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (finalAnswers = answers) => {
    if (submittedRef.current) return;

    submittedRef.current = true;

    try {
      const res = await api.post(`/quizzes/submit/${quizId}`, {
        answers: finalAnswers,
        attemptId,
      });

      router.replace({
        pathname: "/course/[courseId]/result",
        params: {
          score: res.data.score,        // ✅ marks
          total: res.data.totalQuestions, 
          correct: res.data.correctAnswers,
          courseId: courseId,
        },
      });

    } catch (error: any) {
      console.log("❌ Submit error:", error?.response?.data);
      Alert.alert("Error", "Failed to submit quiz");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const q = questions[current];

  if (!q) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text>No questions available</Text>
      </View>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  /* ================= UI ================= */
  return (
    <View className="flex-1 bg-background p-5">

      {/* TIMER */}
      <Text className="text-danger text-right mb-2 font-bold">
        ⏱ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </Text>

      {/* PROGRESS */}
      <Text className="text-textSecondary mb-2">
        Question {current + 1} / {questions.length}
      </Text>

      {/* QUESTION */}
      <Text className="text-textPrimary text-lg font-bold mb-4">
        {q.question}
      </Text>

      {/* OPTIONS */}
      {q.options.map((opt: string, index: number) => (
        <TouchableOpacity
          key={index}
          onPress={() => setSelected(index)}
          className={`p-4 mb-3 rounded-xl border ${
            selected === index
              ? "bg-primary/20 border-primary"
              : "border-border bg-surface"
          }`}
        >
          <Text className="text-textPrimary">{opt}</Text>
        </TouchableOpacity>
      ))}

      {/* BUTTON */}
      <TouchableOpacity
        onPress={handleNext}
        disabled={selected === null}
        className={`p-4 rounded-xl mt-4 ${
          selected === null ? "bg-gray-400" : "bg-primary"
        }`}
      >
        <Text className="text-white text-center font-semibold">
          {current + 1 === questions.length ? "Submit Quiz" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}