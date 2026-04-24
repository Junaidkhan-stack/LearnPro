import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function CreateCourse() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateCourse = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Course title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/teacher/courses", {
        title,
        description,
        status: "draft", // ✅ IMPORTANT
      });

      console.log("✅ Course Created:", res.data);

      Alert.alert(
        "Course Created",
        "You can now add lessons, quizzes, and assignments before submitting for review."
      );

      setTitle("");
      setDescription("");

      router.back();
    } catch (error: any) {
      console.log("❌ Create course error:", error?.response?.data);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create course"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-6">

        <Text className="text-3xl font-bold text-textPrimary">
          Create Course
        </Text>

        <Text className="text-textSecondary mt-1">
          Create your course and start adding content
        </Text>

        <View className="mt-6 bg-primary/10 border border-primary rounded-2xl p-4">
          <View className="flex-row items-center">
            <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
            <Text className="text-primary font-semibold ml-2">
              Draft Mode
            </Text>
          </View>

          <Text className="text-textSecondary text-xs mt-2 leading-4">
            Your course will be saved as a draft. Add lessons and content before submitting it for review.
          </Text>
        </View>

        <View className="mt-6 bg-surface border border-border rounded-2xl p-4">

          <Text className="text-textSecondary mb-1">Course Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Write course title..."
            placeholderTextColor="#9CA3AF"
            className="bg-background border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
          />

          <Text className="text-textSecondary mb-1">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Write course description..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="bg-background border border-border rounded-xl px-4 py-3 h-28 text-textPrimary"
          />
        </View>

        <TouchableOpacity
          onPress={handleCreateCourse}
          disabled={loading}
          className="bg-primary py-4 rounded-2xl mt-6 flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Create Course
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}