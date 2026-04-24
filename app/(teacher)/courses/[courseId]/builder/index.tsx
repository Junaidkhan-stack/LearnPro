import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BuilderScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const items = [
    {
      title: "Lessons",
      route: "lessons",
      icon: "videocam-outline",
      color: "#4F46E5",
    },
    {
      title: "Assignments",
      route: "assignments",
      icon: "document-text-outline",
      color: "#16A34A",
    },
    {
      title: "Quizzes",
      route: "quizzes",
      icon: "help-circle-outline",
      color: "#F59E0B",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-textPrimary mb-2">
          Course Builder
        </Text>

        <Text className="text-textSecondary mb-6">
          Create and edit course content
        </Text>

        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={() =>
              router.push(
                `/(teacher)/courses/${courseId}/builder/${item.route}`,
              )
            }
            className="bg-surface p-5 rounded-2xl mb-4 border border-border"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: item.color + "15" }}
                className="w-12 h-12 rounded-xl items-center justify-center"
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
              </View>

              <Text className="ml-3 text-textPrimary font-semibold flex-1">
                {item.title}
              </Text>

              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
