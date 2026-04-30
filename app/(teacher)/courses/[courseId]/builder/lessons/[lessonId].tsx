import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export default function LessonDetail() {
  const { lessonId } = useLocalSearchParams();
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [title, setTitle] = useState("");

  const player = useVideoPlayer(lesson?.videoUrl || null);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}`);
      setLesson(res.data);
      setTitle(res.data.title);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, []);

  const handleUpdate = async () => {
    try {
      await api.put(`/lessons/${lessonId}`, { title });
      Alert.alert("Updated");
    } catch {
      Alert.alert("Error");
    }
  };

  const handleDelete = async () => {
    await api.delete(`/lessons/${lessonId}`);
    router.back();
  };

  const replaceVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["video/*"],
    });

    if (result.canceled) return;

    const file = result.assets[0];
    const token = await SecureStore.getItemAsync("token");

    const formData = new FormData();

    const uri =
      Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri;

    formData.append("video", {
      uri,
      name: file.name,
      type: file.mimeType,
    } as any);

    setUploadingVideo(true);

    await axios.put(
      `http://192.168.1.6:5001/api/lessons/${lessonId}/video`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    fetchLesson();
    setUploadingVideo(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-3xl font-bold text-textPrimary">
          Lesson Details
        </Text>

        {/* VIDEO */}
        <View className="bg-black rounded-3xl overflow-hidden mt-4 mb-4">
          <VideoView player={player} style={{ width: "100%", height: 220 }} />
        </View>

        <Pressable
          onPress={replaceVideo}
          className="bg-indigo-500 p-3 rounded-xl mb-4"
        >
          <Text className="text-white text-center">Replace Video</Text>
        </Pressable>

        {/* EDIT */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          className="bg-surface border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        />

        <Pressable
          onPress={handleUpdate}
          className="bg-primary p-4 rounded-2xl mb-3"
        >
          <Text className="text-white text-center">Save</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="bg-red-500 p-4 rounded-2xl"
        >
          <Text className="text-white text-center">Delete</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
