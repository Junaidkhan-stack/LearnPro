import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function AssignmentDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const assignmentId = Array.isArray(params.assignmentId)
    ? params.assignmentId[0]
    : params.assignmentId;

  // ✅ FIX: added missing courseId (your error fix)
  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssignment = async () => {
    try {
      const res = await api.get(`/admin/assignments/${assignmentId}`);
      setAssignment(res.data);
    } catch (err) {
      console.log("Assignment error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">Loading assignment...</Text>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <Text className="text-textPrimary">Assignment not found</Text>
      </SafeAreaView>
    );
  }

  const fileUrl =
    assignment.fileUrl ||
    assignment.file ||
    assignment.pdfUrl ||
    assignment.attachment;

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
        <View className="mb-5">
          <Text className="text-2xl font-bold text-textPrimary">
            Assignment Review
          </Text>
          <Text className="text-textSecondary">
            Inspect task details and submission content
          </Text>
        </View>

        {/* TITLE CARD */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-4">
          <Text className="text-xl font-bold text-textPrimary">
            {assignment.title}
          </Text>

          <Text className="text-textSecondary mt-2 leading-5">
            {assignment.description || "No description provided"}
          </Text>
        </View>

        {/* INFO CARD */}
        <View className="bg-primary/5 border border-border rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={16} color="#4F46E5" />
            <Text className="ml-2 text-primary font-semibold">Deadline</Text>
          </View>

          <Text className="text-textPrimary text-sm">
            {assignment.deadline
              ? new Date(assignment.deadline).toDateString()
              : "No deadline set"}
          </Text>

          <Text className="text-textSecondary text-xs mt-2">
            Course: {assignment.course?.title || "N/A"}
          </Text>

          <Text className="text-textSecondary text-xs mt-1">
            Total Marks: {assignment.totalMarks || 0}
          </Text>
        </View>

        {/* FILE SECTION (FIXED + CLEAN) */}
        {fileUrl ? (
          <View className="bg-surface border border-border rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#4F46E5"
                />
                <Text className="ml-2 text-textPrimary font-semibold">
                  Assignment PDF
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(shared)/pdf",
                    params: {
                      url: assignment.fileUrl, 
                    },
                  })
                }
                className="bg-primary px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-xs font-semibold">Open</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="bg-border/30 border border-border rounded-xl p-3 items-center">
            <Ionicons name="document-outline" size={16} color="#9CA3AF" />
            <Text className="text-textSecondary text-xs mt-1">
              No file attached
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
