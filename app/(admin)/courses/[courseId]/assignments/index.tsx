import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function AssignmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/admin/courses/${courseId}/assignments`);
      setAssignments(res.data);
    } catch (err) {
      console.log("Assignments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">Loading assignments...</Text>
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
        <View className="mb-5">
          <Text className="text-2xl font-bold text-textPrimary">
            Course Assignments
          </Text>
          <Text className="text-textSecondary">Review evaluation tasks</Text>
        </View>

        {/* EMPTY STATE */}
        {assignments.length === 0 && (
          <View className="items-center mt-16">
            <Ionicons name="document-outline" size={50} color="#9CA3AF" />
            <Text className="text-textPrimary mt-3 font-semibold">
              No assignments found
            </Text>
            <Text className="text-textSecondary text-center mt-1">
              This course has no assignments yet
            </Text>
          </View>
        )}

        {/* LIST */}
        {assignments.map((a: any, index: number) => (
          <Pressable
            key={a._id}
            onPress={() =>
              router.push({
                pathname:
                  "/(admin)/courses/[courseId]/assignments/[assignmentId]",
                params: {
                  courseId,
                  assignmentId: a._id,
                },
              })
            }
            className="bg-surface border border-border rounded-2xl p-5 mb-4 active:opacity-80"
          >
            {/* TOP */}
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <Text
                  numberOfLines={1}
                  className="text-textPrimary font-semibold text-lg"
                >
                  {index + 1}. {a.title}
                </Text>

                <Text className="text-textSecondary text-xs mt-1">
                  {a.totalMarks} Marks
                </Text>
              </View>

              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
              </View>
            </View>

            {/* DIVIDER */}
            <View className="h-[1px] bg-border my-3 opacity-60" />

            {/* FOOTER */}
            <View className="flex-row justify-between items-center">
              <Text className="text-danger text-xs">
                Due:{" "}
                {a.deadline
                  ? new Date(a.deadline).toDateString()
                  : "No deadline"}
              </Text>

              <View className="bg-indigo-50 px-2 py-1 rounded-md">
                <Text className="text-indigo-600 text-xs font-medium">
                  Open
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
