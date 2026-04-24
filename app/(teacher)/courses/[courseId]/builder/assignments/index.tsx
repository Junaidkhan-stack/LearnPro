import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";

export default function BuilderAssignments() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/assignments/course/${courseId}`);
      setAssignments(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ INITIAL LOAD + AUTO REFRESH
  useEffect(() => {
    fetchAssignments();

    const interval = setInterval(() => {
      fetchAssignments();
    }, 5000); // 🔥 refresh every 5 sec

    return () => clearInterval(interval);
  }, [courseId]);

  // ✅ PULL TO REFRESH
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-textPrimary">
              Assignments
            </Text>
            <Text className="text-textSecondary text-sm">
              Create and edit assignments
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push(
                `/(teacher)/courses/${courseId}/builder/assignments/create`
              )
            }
            className="bg-primary px-4 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
          </Pressable>
        </View>

        {/* LIST */}
        {assignments.map((item) => (
          <Pressable
            key={item._id}
            onPress={() =>
              router.push(
                `/(teacher)/courses/${courseId}/builder/assignments/${item._id}`
              )
            }
            className="bg-surface p-5 rounded-2xl mb-4 border border-border"
          >
            <Text className="text-textPrimary font-semibold">
              {item.title}
            </Text>

            <Text className="text-textSecondary text-xs mt-1">
              Deadline: {new Date(item.deadline).toLocaleDateString()}
            </Text>

            <Text className="text-primary text-xs mt-1">
              Total Marks: {item.totalMarks || 100}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}