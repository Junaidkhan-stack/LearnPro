import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { api } from "@/services/api";

export default function CreateAssignment() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marks, setMarks] = useState("");
  const [file, setFile] = useState<any>(null);

  const [deadline, setDeadline] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= FILE PICKER ================= */
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const selected = result.assets[0];

    if (!selected.uri) {
      Alert.alert("Error", "Invalid file selected");
      return;
    }

    setFile(selected);
  };

  /* ================= SUBMIT ================= */
  const handleCreate = async () => {
    if (!title || !description || !marks) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // ✅ FIX: backend expects courseId in body
      formData.append("courseId", courseId as string);

      formData.append("title", title);
      formData.append("description", description);

      // ✅ FIX: marks → totalMarks (backend field name)
      formData.append("totalMarks", marks);

      formData.append("deadline", deadline.toISOString());

if (file?.uri) {
let fileUri = file.uri;
if (!fileUri.startsWith("file://")) {
  fileUri = "file://" + fileUri;
}

const fileToUpload = {
  uri: fileUri,
  name: file.name || `assignment-${Date.now()}.pdf`,
  type: "application/pdf",
};

formData.append("file", fileToUpload as any);
}

      // ❌ FIX: removed /${courseId}
      await api.post(`/assignments/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Assignment created ✅");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
      >

        {/* HEADER */}
        <Text className="text-textPrimary text-2xl font-bold mb-6">
          Create Assignment
        </Text>

        {/* TITLE */}
        <Text className="text-textSecondary mb-1">Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter assignment title"
          className="bg-surface p-4 rounded-xl border border-border mb-4"
        />

        {/* DESCRIPTION */}
        <Text className="text-textSecondary mb-1">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          multiline
          className="bg-surface p-4 rounded-xl border border-border mb-4"
        />

        {/* MARKS */}
        <Text className="text-textSecondary mb-1">Marks *</Text>
        <TextInput
          value={marks}
          onChangeText={setMarks}
          keyboardType="numeric"
          placeholder="e.g. 100"
          className="bg-surface p-4 rounded-xl border border-border mb-4"
        />

        {/* DEADLINE */}
        <Text className="text-textSecondary mb-1">
          Deadline
        </Text>

        <Pressable
          onPress={() => setShowPicker(true)}
          className="bg-surface p-4 rounded-xl border border-border mb-4"
        >
          <Text className="text-textPrimary">
            {deadline.toDateString()}
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDeadline(selectedDate);
            }}
          />
        )}

        {/* FILE UPLOAD */}
        <Text className="text-textSecondary mb-1">
          Upload PDF *
        </Text>

        <Pressable
          onPress={pickFile}
          className="bg-surface p-4 rounded-xl border border-border flex-row items-center justify-between mb-6"
        >
          <Text className="text-textPrimary">
            {file ? file.name : "Select PDF file"}
          </Text>

          <Ionicons name="attach-outline" size={20} color="#4F46E5" />
        </Pressable>

        {/* SUBMIT BUTTON */}
        <Pressable
          onPress={handleCreate}
          disabled={loading}
          className={`p-4 rounded-xl ${
            loading ? "bg-gray-400" : "bg-primary"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Creating..." : "Create Assignment"}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}