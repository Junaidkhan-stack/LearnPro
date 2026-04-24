import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

type Analytics = {
  totalStudents: number;
  totalLessons: number;
  totalAssignments: number;
  totalQuizzes: number;
  averageScore: number;
  lessonProgress: number;
  quizAverage: number;
  assignmentCompletion: number;
};

export default function AnalyticsScreen() {
  const params = useLocalSearchParams();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/analytics`);
      setData(res.data);
    } catch (error) {
      console.log("❌ Analytics error:", error);

      setData({
        totalStudents: 0,
        totalLessons: 0,
        totalAssignments: 0,
        totalQuizzes: 0,
        averageScore: 0,
        lessonProgress: 0,
        quizAverage: 0,
        assignmentCompletion: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-textSecondary">
          No analytics available
        </Text>
      </SafeAreaView>
    );
  }

  /* ================= CARD ================= */
  const StatCard = ({ icon, label, value, accent }: any) => (
    <View className="w-[48%] bg-surface/90 p-5 rounded-2xl mb-4 border border-border">
      <Ionicons name={icon} size={20} color={accent} />
      <Text className="text-textSecondary mt-3 text-xs">
        {label}
      </Text>
      <Text className="text-textPrimary text-2xl font-bold mt-1">
        {value}
      </Text>
    </View>
  );

  /* ================= FIXED PROGRESS CHIP ================= */
  const ProgressChip = ({ label, value, color }: any) => {
    const safe = Math.min(100, Math.max(0, value || 0));

    const getStatus = (v: number) => {
      if (v >= 50)
        return {
          text: "Excellent",
          bg: "bg-green-500/10",
          textColor: "text-green-500",
        };
      if (v >= 30)
        return {
          text: "Good",
          bg: "bg-yellow-500/10",
          textColor: "text-yellow-500",
        };
      return {
        text: "Low",
        bg: "bg-red-500/10",
        textColor: "text-red-500",
      };
    };

    const status = getStatus(safe);

    return (
      <View className="flex-row justify-between items-center py-3 border-b border-border/40">
        {/* LEFT */}
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-2 ${color}`} />
          <Text className="text-textSecondary text-sm">
            {label}
          </Text>
        </View>

        {/* RIGHT */}
        <View className="flex-row items-center">
          <Text className="text-textPrimary font-semibold mr-2">
            {Math.round(safe)}%
          </Text>

          {/* FIXED BADGE */}
          <View className={`px-2 py-1 rounded-full ${status.bg}`}>
            <Text className={`text-xs ${status.textColor}`}>
              {status.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-textPrimary">
            Course Analytics
          </Text>
          <Text className="text-textSecondary mt-1">
            Teacher performance dashboard overview
          </Text>
        </View>

        {/* STATS */}
        <View className="flex-row flex-wrap justify-between">
          <StatCard icon="people-outline" label="Students" value={data.totalStudents} accent="#6366F1" />
          <StatCard icon="book-outline" label="Lessons" value={data.totalLessons} accent="#38BDF8" />
          <StatCard icon="document-text-outline" label="Assignments" value={data.totalAssignments} accent="#22C55E" />
          <StatCard icon="help-circle-outline" label="Quizzes" value={data.totalQuizzes} accent="#F59E0B" />
        </View>

        {/* SCORE */}
        <View className="bg-surface/90 p-6 rounded-2xl border border-border mb-5">
          <Text className="text-textSecondary text-sm">
            Overall Course Performance
          </Text>

          <Text className="text-5xl font-bold text-primary mt-2">
            {data.averageScore}%
          </Text>

          <Text className="text-textSecondary text-xs mt-3">
            Weighted system: Lessons 50% • Quiz 30% • Assignment 20%
          </Text>
        </View>

        {/* BREAKDOWN */}
        <View className="bg-surface/90 p-5 rounded-2xl border border-border">
          <Text className="text-textPrimary font-semibold mb-3">
            Performance Breakdown
          </Text>

          <ProgressChip
            label="Lesson Progress (50%)"
            value={data.lessonProgress}
            color="bg-blue-500"
          />

          <ProgressChip
            label="Quiz Performance (30%)"
            value={data.quizAverage}
            color="bg-indigo-500"
          />

          <ProgressChip
            label="Assignment Completion (20%)"
            value={data.assignmentCompletion}
            color="bg-green-500"
          />
        </View>

        {/* INSIGHT */}
        <View className="mt-5 bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb-outline" size={18} color="#6366F1" />
            <Text className="text-primary font-semibold ml-2">
              Teacher Insight
            </Text>
          </View>

          <Text className="text-textSecondary text-sm leading-5">
            {data.averageScore > 70
              ? "Excellent performance. Students are highly engaged."
              : data.averageScore > 40
              ? "Moderate performance. Some students need attention."
              : "Low performance detected. Immediate intervention recommended."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}