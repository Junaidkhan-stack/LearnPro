import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CourseLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerTitle: "", // no title
        headerShadowVisible: false,
        headerTintColor: "#4F46E5",

        // ✅ GLOBAL BACK ARROW (applies to ALL screens)
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="lessons" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="assignments" />
      <Stack.Screen name="progress" />
    </Stack>
  );
}