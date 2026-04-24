import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";

export default function ProgressScreen() {
  /* ================= PARAM ================= */
  const params = useLocalSearchParams();

  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : params.courseId?.[0];

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  /* ================= FETCH ================= */
  const fetchProgress = async () => {
    try {
      const res = await api.get(
        `/enrollment/progress/${courseId}`
      );

      setProgress(res.data);
    } catch (error: any) {
      console.log("❌ Progress error:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (courseId) fetchProgress();
  }, [courseId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  /* ================= NO DATA ================= */
  if (!progress) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-textPrimary">No progress data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = (progress.overallProgress || 0) >= 100;

  /* ================= UI ================= */
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* ================= HEADER CARD ================= */}
        <View className="bg-surface border border-border rounded-3xl p-6 mb-6">
          
          <View className="flex-row items-center justify-between">
            <Text className="text-textPrimary text-xl font-bold">
              Course Progress
            </Text>

            <View
              className={`px-3 py-1 rounded-full ${
                isCompleted ? "bg-green-100" : "bg-indigo-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isCompleted ? "text-green-700" : "text-primary"
                }`}
              >
                {isCompleted ? "Completed" : "In Progress"}
              </Text>
            </View>
          </View>

          {/* BIG NUMBER */}
          <Text className="text-5xl font-extrabold text-textPrimary mt-4">
            {progress.overallProgress || 0}
            <Text className="text-2xl">%</Text>
          </Text>

          <Text className="text-textSecondary mt-1">
            Overall completion across all activities
          </Text>
        </View>

        {/* ================= BREAKDOWN TITLE ================= */}
        <Text className="text-textPrimary text-lg font-bold mb-3">
          Breakdown
        </Text>

        {/* ================= CARDS GRID ================= */}
        <View className="gap-4">

          {/* LESSONS */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="play-circle" size={22} color="#6366F1" />
                <Text className="ml-2 font-semibold text-textPrimary">
                  Lessons
                </Text>
              </View>

              <Text className="text-textPrimary font-bold">
                {progress.videoProgress?.toFixed(0) || 0}%
              </Text>
            </View>

            <Text className="text-textSecondary text-xs mt-2">
              Weight: 50% of course
            </Text>
          </View>

          {/* QUIZZES */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="quiz" size={22} color="#F59E0B" />
                <Text className="ml-2 font-semibold text-textPrimary">
                  Quizzes
                </Text>
              </View>

              <Text className="text-textPrimary font-bold">
                {progress.quizProgress?.toFixed(0) || 0}%
              </Text>
            </View>

            <Text className="text-textSecondary text-xs mt-2">
              Weight: 30% of course
            </Text>
          </View>

          {/* ASSIGNMENTS */}
          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="document-text" size={22} color="#22C55E" />
                <Text className="ml-2 font-semibold text-textPrimary">
                  Assignments
                </Text>
              </View>

              <Text className="text-textPrimary font-bold">
                {progress.assignmentProgress?.toFixed(0) || 0}%
              </Text>
            </View>

            <Text className="text-textSecondary text-xs mt-2">
              Weight: 20% of course
            </Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}