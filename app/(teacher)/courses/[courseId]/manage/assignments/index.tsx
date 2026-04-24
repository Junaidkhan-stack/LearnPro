import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

export default function ManageAssignments() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/assignments/course/${courseId}`);
      setAssignments(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssignments();
    }, [courseId])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">
          Loading assignments...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10 }}>

        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-textPrimary">
            Manage Assignments
          </Text>
          <Text className="text-textSecondary mt-1">
            Submissions & grading control
          </Text>
        </View>

        {/* LIST */}
        {assignments.map((item) => {
          const isActive = new Date(item.deadline) > new Date();

          return (
            <View
              key={item._id}
              className="bg-surface p-5 rounded-2xl mb-4 border border-border"
            >

              {/* TITLE + STATUS */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-textPrimary font-semibold text-base flex-1 mr-2">
                  {item.title}
                </Text>

                <View
                  className={`px-3 py-1 rounded-full ${
                    isActive ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isActive ? "Active" : "Completed"}
                  </Text>
                </View>
              </View>

              {/* DEADLINE */}
              <Text className="text-textSecondary text-xs mb-1">
                Deadline: {new Date(item.deadline).toDateString()}
              </Text>

              {/* MARKS */}
              <Text className="text-primary text-xs mb-3">
                Total Marks: {item.totalMarks}
              </Text>

              {/* SUBMISSIONS BOX */}
              <View className="bg-background border border-border p-3 rounded-xl mb-4">
                <Text className="text-textSecondary text-xs">
                  Submissions
                </Text>
                <Text className="text-textPrimary font-semibold text-lg">
                  {item.submissionsCount || 0}
                </Text>
              </View>

              {/* ACTIONS */}
              <View className="flex-row">

                {/* VIEW SUBMISSIONS */}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(teacher)/courses/[courseId]/manage/assignments/submissions",
                      params: {
                        courseId: courseId as string,
                        assignmentId: item._id,
                        fileurl: item.fileurl,
                      },
                    })
                  }
                  className="flex-1 bg-primary/10 p-3 rounded-xl flex-row justify-center items-center"
                >
                  <Ionicons name="eye-outline" size={18} color="#4F46E5" />
                  <Text className="text-primary ml-2 font-medium">
                    Submissions
                  </Text>
                </Pressable>

              </View>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}