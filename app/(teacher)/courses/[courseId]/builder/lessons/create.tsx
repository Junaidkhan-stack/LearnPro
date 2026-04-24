import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function CreateLesson() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
    });

    if (result.canceled) return;

    const file = result.assets[0];

    if (!title.trim()) {
      Alert.alert("Error", "Enter lesson title first");
      return;
    }

    try {
      setUploading(true);

      const token = await SecureStore.getItemAsync("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("courseId", String(courseId));

      const uri =
        Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri;

      formData.append("video", {
        uri,
        name: file.name || "video.mp4",
        type: file.mimeType || "video/mp4",
      } as any);

      await axios.post(
        `http://192.168.1.16:5001/api/lessons/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert("Success", "Lesson uploaded");
      router.back();
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-3xl font-bold text-textPrimary">
          Create Lesson
        </Text>

        <Text className="text-textSecondary mb-5">Upload video lesson</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Lesson Title"
          className="bg-surface border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        />

        <Pressable
          onPress={pickVideo}
          disabled={uploading}
          className="bg-primary p-4 rounded-2xl"
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">
              Upload Video
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
