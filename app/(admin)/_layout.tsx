import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function AdminLayout() {
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
        headerTitle: "",
        headerStyle: {
          backgroundColor: "#F8FAFF",
        },
        headerTintColor: "#4F46E5",

        // 🔥 APPLY EVERYWHERE
        headerLeft: () => <BackButton />,
      }}
    >
      {/* TABS (MAIN ENTRY) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* COURSES */}
      <Stack.Screen name="courses/[courseId]/index" />
      <Stack.Screen name="courses/[courseId]/edit" />

      {/* LESSONS */}
      <Stack.Screen name="courses/[courseId]/lessons/index" />
      <Stack.Screen name="courses/[courseId]/lessons/[lessonId]" />
      <Stack.Screen name="courses/[courseId]/lessons/[lessonId]/edit" />

      {/* USERS */}
      <Stack.Screen name="users/[userId]/index" />
      <Stack.Screen name="users/[userId]/edit" />
      <Stack.Screen name="users/[userId]/enrollments" />

      {/* OPTIONAL */}
      <Stack.Screen name="analytics/index" />
    </Stack>
  );
}