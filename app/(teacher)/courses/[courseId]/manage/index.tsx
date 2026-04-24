import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ManageScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const items = [
    {
      title: "Students",
      route: "students",
      icon: "people-outline",
      color: "#0EA5E9",
    },
    {
      title: "Analytics",
      route: "analytics",
      icon: "stats-chart-outline",
      color: "#6366F1",
    },
    {
      title: "Submissions",
      route: "assignments",
      icon: "document-outline",
      color: "#EF4444",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10 }}>
        <Text className="text-2xl font-bold text-textPrimary mb-2">
          Course Management
        </Text>

        <Text className="text-textSecondary mb-6">
          Monitor students & performance
        </Text>

        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={() =>
              router.push(`/(teacher)/courses/${courseId}/manage/${item.route}`)
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
