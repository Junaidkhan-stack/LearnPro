import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function Submissions() {
  const router = useRouter();
  const { assignmentId, courseId } = useLocalSearchParams();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) fetchData();
  }, [assignmentId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [assignmentId]),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">Loading submissions...</Text>
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
        <View className="mb-5">
          <Text className="text-2xl font-bold text-textPrimary">
            Submissions
          </Text>
          <Text className="text-textSecondary mt-1">
            Student assignment responses
          </Text>
        </View>

        {/* LIST */}
        {submissions.map((item) => {
          const isGraded = item.graded;

          return (
            <View
              key={item._id}
              className="bg-surface p-5 rounded-2xl mb-4 border border-border"
            >
              {/* PERSON HEADER */}
              <View className="flex-row items-center mb-4">
                {/* AVATAR */}
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name="person" size={22} color="#4F46E5" />
                </View>

                {/* NAME + EMAIL */}
                <View className="ml-3 flex-1">
                  <Text className="text-textPrimary font-semibold">
                    {item.student?.name}
                  </Text>
                  <Text className="text-textSecondary text-xs">
                    {item.student?.email}
                  </Text>
                </View>

                {/* STATUS */}
                <View
                  className={`px-3 py-1 rounded-full ${
                    isGraded ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isGraded ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {isGraded ? "Graded" : "Pending"}
                  </Text>
                </View>
              </View>

              {/* MARKS (ONLY IF GRADED) */}
              {isGraded && (
                <View className="mb-4">
                  <Text className="text-textSecondary text-xs">Marks</Text>
                  <Text className="text-primary text-xl font-bold">
                    {item.marks}
                  </Text>
                </View>
              )}

              {/* ACTION */}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname:
                      "/(teacher)/courses/[courseId]/manage/assignments/grade",
                    params: {
                      courseId: courseId as string,
                      submissionId: item._id,
                      fileUrl: item.fileUrl,
                      marks: item.marks,
                      feedback: item.feedback,
                      isEdit: item.graded ? "true" : "false",
                    },
                  })
                }
                className={`p-3 rounded-xl flex-row justify-center items-center ${
                  isGraded ? "bg-blue-100" : "bg-primary/10"
                }`}
              >
                <Ionicons
                  name={isGraded ? "create-outline" : "pencil-outline"}
                  size={18}
                  color="#4F46E5"
                />
                <Text className="text-primary ml-2 font-medium">
                  {isGraded ? "Edit Grade" : "Grade Submission"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
