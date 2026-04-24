import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

export default function GradeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : params.courseId?.[0];

  const submissionId =
    typeof params.submissionId === "string"
      ? params.submissionId
      : params.submissionId?.[0];

  const fileUrl =
    typeof params.fileUrl === "string" ? params.fileUrl : params.fileUrl?.[0];

  const isEdit = params.isEdit === "true";

  const existingMarks = typeof params.marks === "string" ? params.marks : "";

  const existingFeedback =
    typeof params.feedback === "string" ? params.feedback : "";

  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setMarks(existingMarks || "");
      setFeedback(existingFeedback || "");
    }
  }, []);

  const handleGrade = async () => {
    if (!marks) {
      Alert.alert("Error", "Please enter marks");
      return;
    }

    try {
      setLoading(true);

      await api.put(`/assignments/grade/${submissionId}`, {
        marks,
        feedback,
      });

      Alert.alert(
        "Success",
        isEdit ? "Updated successfully" : "Graded successfully",
      );
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed");
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
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-textPrimary text-2xl font-bold">
            {isEdit ? "Edit Grade" : "Grade Submission"}
          </Text>
          <Text className="text-textSecondary mt-1">
            Review submission and assign marks
          </Text>
        </View>

        {/* PDF CARD */}
        <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
          <Text className="text-textPrimary font-semibold mb-2">
            Student Submission
          </Text>

          <Pressable
            onPress={() => {
              if (!fileUrl) {
                Alert.alert("Error", "PDF not found");
                return;
              }
              router.push({
                pathname: "/(shared)/pdf",
                params: {
                  url: fileUrl,
                },
              });
            }}
            className="bg-primary/10 p-4 rounded-xl flex-row justify-center items-center"
          >
            <Ionicons name="document-text-outline" size={20} color="#4F46E5" />
            <Text className="text-primary ml-2 font-medium">
              Open Submitted PDF
            </Text>
          </Pressable>
        </View>

        {/* MARKS INPUT */}
        <View className="mb-4">
          <Text className="text-textSecondary mb-1">Marks *</Text>
          <TextInput
            value={marks}
            onChangeText={setMarks}
            keyboardType="numeric"
            placeholder="Enter marks"
            className="bg-surface p-4 rounded-xl border border-border text-textPrimary"
          />
        </View>

        {/* FEEDBACK INPUT */}
        <View className="mb-6">
          <Text className="text-textSecondary mb-1">Feedback</Text>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Write detailed feedback..."
            multiline
            className="bg-surface p-4 rounded-xl border border-border text-textPrimary h-28"
          />
        </View>

        {/* SUBMIT BUTTON */}
        <Pressable
          onPress={handleGrade}
          disabled={loading}
          className={`p-4 rounded-xl flex-row justify-center items-center ${
            loading ? "bg-gray-400" : "bg-primary"
          }`}
        >
          <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">
            {loading
              ? "Submitting..."
              : isEdit
                ? "Update Grade"
                : "Submit Grade"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
