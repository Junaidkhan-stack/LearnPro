import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/services/api";
import { useEffect, useState } from "react";

export default function CourseHub() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);

  /* ================= FETCH ================= */
  const fetchCourse = async () => {
    try {
      const res = await api.get("/teacher/courses");
      const found = res.data.find((c: any) => c._id === courseId);
      setCourse(found);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  /* ================= SUBMIT ================= */
  const submitForReview = async () => {
    try {
      await api.put(`/teacher/courses/${courseId}/status`, {
        status: "pending",
      });

      await fetchCourse();

      Alert.alert("Submitted ✔", "Sent for admin review");
    } catch (err) {
      Alert.alert("Error", "Failed to submit");
    }
  };

  const isPending = course?.status === "pending";

  const sections = [
    {
      title: "Builder",
      route: "builder",
      icon: "construct-outline",
      color: "#4F46E5",
      desc: "Create lessons, assignments, quizzes",
    },
    {
      title: "Manage",
      route: "manage",
      icon: "settings-outline",
      color: "#0EA5E9",
      desc: "Students, analytics & submissions",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10 }}>
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-2xl font-bold text-textPrimary">
              Course Hub
            </Text>
            <Text className="text-textSecondary">Manage your course</Text>
          </View>

          {(course?.status === "draft" || course?.status === "rejected") && (
            <Pressable
              onPress={submitForReview}
              disabled={isPending}
              className={`px-4 py-3 rounded-xl ${
                isPending ? "bg-gray-300" : "bg-primary"
              }`}
            >
              <Text className="text-white text-xs font-semibold">
                {isPending ? "Submitted" : "Submit"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* STATUS */}
        <View className="flex-row items-center mb-4">
          <Text className="text-xs text-textSecondary mr-2">Status:</Text>

          <View
            className={`px-3 py-1 rounded-full ${
              course?.status === "approved"
                ? "bg-success/10"
                : course?.status === "rejected"
                  ? "bg-danger/10"
                  : course?.status === "pending"
                    ? "bg-primary/10"
                    : "bg-border"
            }`}
          >
            <Text
              className={`text-[11px] font-semibold ${
                course?.status === "approved"
                  ? "text-success"
                  : course?.status === "rejected"
                    ? "text-danger"
                    : course?.status === "pending"
                      ? "text-primary"
                      : "text-textSecondary"
              }`}
            >
              {(course?.status || "draft").toUpperCase()}
            </Text>
          </View>
        </View>
        {/* REJECTION REASON */}
        {course?.status === "rejected" && course?.rejectionReason && (
          <View className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-4">
            <Text className="text-danger font-semibold text-sm mb-1">
              Rejection Reason
            </Text>

            <Text className="text-textPrimary text-xs leading-5">
              {course.rejectionReason}
            </Text>
            <Text className="text-textSecondary text-[11px] mt-2">
              Please update your course and resubmit for approval.
            </Text>
          </View>
        )}
        {/* SECTIONS */}
        {sections.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              const isBuilder = item.route === "builder";
              const isEditable =
                course?.status === "draft" || course?.status === "rejected";

              // ❌ LOCK BUILDER
              if (isBuilder && !isEditable) {
                Alert.alert(
                  "Locked 🔒",
                  "You cannot edit this course after submission.",
                );
                return;
              }

              // ✅ NAVIGATE
              router.push(`/(teacher)/courses/${courseId}/${item.route}`);
            }}
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

              <View className="ml-3 flex-1">
                <Text className="text-textPrimary font-semibold">
                  {item.title}
                </Text>
                <Text className="text-textSecondary text-xs">{item.desc}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
