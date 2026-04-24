import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

export default function EditAssignment() {
  const router = useRouter();
  const { courseId, assignmentId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marks, setMarks] = useState("");
  const [deadline, setDeadline] = useState(new Date());

  const [file, setFile] = useState<any>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!assignmentId) return; // ✅ FIX

    const fetchAssignment = async () => {
      try {
        const res = await api.get(
          `/assignments/${assignmentId}`
        );

        const data = res.data;

        setTitle(data.title);
        setDescription(data.description || "");
        setMarks(String(data.totalMarks));
        setDeadline(new Date(data.deadline));
      } catch (error) {
        console.log("Fetch error:", error); // ❌ no alert
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  /* ================= FILE PICKER ================= */
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    setFile(result.assets[0]);
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("totalMarks", marks);
      formData.append("deadline", deadline.toISOString());

      if (file) {
        formData.append("file", {
          uri: file.uri,
          name: file.name || "assignment.pdf",
          type: file.mimeType || "application/pdf",
        } as any);
      }

      await api.put(
        `/assignments/${assignmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Updated successfully ✅");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = () => {
    Alert.alert("Delete Assignment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/assignments/${assignmentId}`);
            Alert.alert("Deleted", "Assignment removed");
            router.back();
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  /* ================= LOADING SKELETON ================= */
  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background justify-center items-center"
        edges={["left", "right", "bottom"]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-3">
          Loading assignment...
        </Text>
      </SafeAreaView>
    );
  }

  /* ================= UI ================= */
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
          Edit Assignment
        </Text>

        {/* TITLE */}
        <Text className="text-textSecondary mb-1">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          className="bg-surface p-4 rounded-xl border border-border mb-4 text-textPrimary"
        />

        {/* DESCRIPTION */}
        <Text className="text-textSecondary mb-1">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          className="bg-surface p-4 rounded-xl border border-border mb-4 text-textPrimary"
        />

        {/* MARKS */}
        <Text className="text-textSecondary mb-1">Marks</Text>
        <TextInput
          value={marks}
          onChangeText={setMarks}
          keyboardType="numeric"
          className="bg-surface p-4 rounded-xl border border-border mb-4 text-textPrimary"
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
            onChange={(e, d) => {
              setShowPicker(false);
              if (d) setDeadline(d);
            }}
          />
        )}

        {/* FILE */}
        <Text className="text-textSecondary mb-1">
          Replace PDF (optional)
        </Text>

        <Pressable
          onPress={pickFile}
          className="bg-surface p-4 rounded-xl border border-border flex-row justify-between items-center mb-6"
        >
          <Text className="text-textPrimary">
            {file ? file.name : "Select new file"}
          </Text>

          <Ionicons name="attach-outline" size={20} color="#4F46E5" />
        </Pressable>

        {/* UPDATE */}
        <Pressable
          onPress={handleUpdate}
          disabled={saving}
          className={`p-4 rounded-xl mb-4 ${
            saving ? "bg-gray-400" : "bg-primary"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {saving ? "Updating..." : "Update Assignment"}
          </Text>
        </Pressable>

        {/* DELETE */}
        <Pressable
          onPress={handleDelete}
          className="p-4 rounded-xl bg-red-100"
        >
          <Text className="text-red-600 text-center font-semibold">
            Delete Assignment
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}