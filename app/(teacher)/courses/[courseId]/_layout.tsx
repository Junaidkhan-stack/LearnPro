import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function Layout() {
  const router = useRouter();

  const BackButton = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ paddingRight: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color="#4F46E5" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerTitle: "", // ✅ REMOVE ALL TITLES
        headerStyle: {
          backgroundColor: "#F8FAFF",
        },
        headerTintColor: "#4F46E5",

        // 🔥 APPLY TO ALL SCREENS
        headerLeft: () => <BackButton />,
      }}
    >
      {/* ALL SCREENS */}
      <Stack.Screen name="index" />
      <Stack.Screen name="lessons/index" />
      <Stack.Screen name="quizzes/index" />
      <Stack.Screen name="assignments/index" />
      <Stack.Screen name="students" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}