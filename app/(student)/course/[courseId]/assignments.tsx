import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { api } from "@/services/api";

export default function AssignmentScreen() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  /* ================= FETCH ================= */
  const fetchAssignments = async () => {
    if (!courseId) return;

    try {
      const res = await api.get(`/assignments/course/${courseId}`);
      setAssignments(res.data || []);
    } catch (error: any) {
      Alert.alert("Error", "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  /* ================= UPLOAD ================= */
  const handleUpload = async (assignmentId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];

      console.log("📂 FILE:", file);

      /* 🚨 BLOCK INVALID FILES (Drive etc) */
      if (!file.uri || file.size === 0) {
        Alert.alert(
          "Upload from Downloads only",
          "Please select your PDF from your phone Downloads folder.\n\nFiles from Google Drive or other apps are not supported.",
        );
        return;
      }

      setUploadingId(assignmentId);

      const formData = new FormData();

      // ✅ FIX ANDROID FILE URI
      let fileUri = file.uri;
      if (!fileUri.startsWith("file://")) {
        fileUri = "file://" + fileUri;
      }

      // ✅ FORCE CORRECT PDF TYPE
      const fileToUpload = {
        uri: fileUri,
        name: file.name || `assignment-${Date.now()}.pdf`,
        type: "application/pdf",
      };

      formData.append("file", fileToUpload as any);

      console.log("📡 Uploading...");

      const res = await api.post(
        `/assignments/submit/${assignmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Upload success:", res.data);

      Alert.alert("Success", "Assignment submitted ✅");

      fetchAssignments();
    } catch (error: any) {
      console.log("❌ FULL ERROR:", error);

      /* 🔥 HANDLE ANDROID FILE ERROR */
      if (
        error?.message?.includes("FileNotFoundException") ||
        error?.message?.includes("Cello error")
      ) {
        Alert.alert(
          "Upload from Downloads only",
          "Please select your PDF from your phone Downloads folder.",
        );
        return;
      }

      console.log("❌ RESPONSE:", error?.response?.data);

      Alert.alert("Error", error?.response?.data?.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <ScrollView className="flex-1 bg-background p-5">
      <Text className="text-textPrimary text-2xl font-bold mb-5">
        Assignments
      </Text>

      {assignments.map((item) => {
        const isSubmitted = !!item.submission;
        const isDeadlinePassed = new Date() > new Date(item.deadline);

        return (
          <View
            key={item._id}
            className="bg-surface p-5 mb-4 rounded-2xl border border-border"
          >
            {/* TITLE */}
            <Text className="text-textPrimary text-lg font-semibold">
              {item.title}
            </Text>

            {/* DESCRIPTION */}
            {item.description ? (
              <Text className="text-textSecondary mt-2">
                {item.description}
              </Text>
            ) : null}

            {/* DEADLINE */}
            <Text className="text-textSecondary text-sm mt-2">
              Deadline: {new Date(item.deadline).toLocaleDateString()}
            </Text>

            {/* 📄 VIEW PDF */}
            {item.fileUrl && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(shared)/pdf",
                    params: {
                      url: item.fileUrl,
                    },
                  })
                }
                className="mt-3 bg-indigo-100 p-2 rounded-lg"
              >
                <Text className="text-indigo-700 text-center">
                  📄 View Assignment PDF
                </Text>
              </Pressable>
            )}

            {/* ✅ STATUS (FIXED) */}
            {isSubmitted ? (
              <View className="mt-5 bg-green-100 p-3 rounded-xl">
                <Text className="text-green-700 text-center font-semibold">
                  ✅ Submitted
                </Text>

                {item.submission?.graded ? (
                  <View className="mt-3 bg-white p-3 rounded-lg">
                    <Text className="font-semibold">
                      Marks: {item.submission.marks}
                    </Text>
                    <Text className="mt-1">
                      {item.submission.feedback || "No feedback"}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center mt-2">⏳ Awaiting grading</Text>
                )}
              </View>
            ) : isDeadlinePassed ? (
              <View className="mt-5 bg-red-100 p-3 rounded-xl">
                <Text className="text-red-700 text-center font-semibold">
                  ❌ Deadline Passed
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => handleUpload(item._id)}
                disabled={uploadingId === item._id}
                className={`mt-5 p-3 rounded-xl ${
                  uploadingId === item._id ? "bg-gray-400" : "bg-primary"
                }`}
              >
                <Text className="text-white text-center">
                  {uploadingId === item._id ? "Uploading..." : "Upload PDF"}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      {assignments.length === 0 && (
        <Text className="text-textSecondary text-center mt-10">
          No assignments available
        </Text>
      )}
    </ScrollView>
  );
}
