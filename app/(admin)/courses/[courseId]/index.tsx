import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Modal } from "react-native";

type CourseStatus = "approved" | "rejected" | "pending" | "deleted";

export default function CourseDetail() {
  const params = useLocalSearchParams();
  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [rejectModal, setRejectModal] = useState(false);

  /* ================= FETCH ================= */
  const fetchCourse = async () => {
    try {
      const res = await api.get("/admin/courses");
      const found = res.data.find((c: any) => c._id === courseId);
      setCourse(found);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    const interval = setInterval(fetchCourse, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourse();
  }, []);

  /* ================= ACTIONS ================= */
  const updateStatus = async (status: CourseStatus, reason?: string) => {
    try {
      await api.put(`/admin/courses/${courseId}/status`, {
        status,
        rejectionReason: reason || "",
      });

      setCourse((prev: any) => ({
        ...prev,
        status,
        rejectionReason: reason,
      }));

      Alert.alert("Success", `Course ${status}`);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCourse = async () => {
    try {
      await api.delete(`/admin/courses/${courseId}`);

      setCourse((prev: any) => ({
        ...prev,
        isDeleted: true,
      }));

      Alert.alert("Deleted", "Course removed");
    } catch (error) {
      console.log(error);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-2">
          Loading course details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <Text className="text-textPrimary">Course not found</Text>
      </SafeAreaView>
    );
  }

  const isDeleted = course.isDeleted === true;
  const isRejected = course.status === "rejected";

  /* ================= STATUS COLORS ================= */
  const statusColors: Record<CourseStatus, string> = {
    approved: "#16A34A",
    rejected: "#DC2626",
    pending: "#f8cc05",
    deleted: "#6B7280",
  };

  const statusKey: CourseStatus = isDeleted
    ? "deleted"
    : (course.status as CourseStatus) || "pending";

  const statusColor = statusColors[statusKey];

  const statusLabel = isDeleted
    ? "DELETED"
    : course.status?.toUpperCase() || "PENDING";

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 30,
        }}
      >
        {/* HEADER */}
        <View className="mb-2">
          <Text className="text-3xl font-bold text-textPrimary">
            Course Review
          </Text>
          <Text className="text-textSecondary">
            Review content and take action
          </Text>
        </View>

        {/* STATUS */}
        <View
          className="self-start px-4 py-1 rounded-full mb-4"
          style={{ backgroundColor: statusColor + "15" }}
        >
          <Text style={{ color: statusColor, fontWeight: "700" }}>
            {statusLabel}
          </Text>
        </View>

        {/* COURSE CARD */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-4">
          <Text className="text-xl font-bold text-textPrimary">
            {course.title}
          </Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-textSecondary text-xs ml-2">
              {course.createdAt
                ? new Date(course.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>

          <Text className="text-textSecondary mt-3 leading-5">
            {course.description || "No description provided"}
          </Text>
        </View>

        {/* INSTRUCTOR */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-5">
          <Text className="text-textPrimary font-semibold mb-3">
            Instructor
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="person-circle-outline" size={26} color="#4F46E5" />
            <View className="ml-3">
              <Text className="text-textPrimary font-medium">
                {course.teacher?.name || "Unknown"}
              </Text>
              <Text className="text-textSecondary text-xs">
                {course.teacher?.email || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        {!isDeleted && (
          <View className="mb-6">
            <Text className="text-textPrimary font-semibold mb-3">
              Course Content
            </Text>

            <View className="flex-row justify-between">
              {[
                {
                  label: "Lessons",
                  count: course.lessonsCount,
                  icon: "book-outline" as const,
                  route: "lessons",
                },
                {
                  label: "Assignments",
                  count: course.assignmentsCount,
                  icon: "document-text-outline" as const,
                  route: "assignments",
                },
                {
                  label: "Quizzes",
                  count: course.quizzesCount,
                  icon: "help-circle-outline" as const,
                  route: "quizzes",
                },
              ].map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    router.push(
                      `/(admin)/courses/${courseId}/${item.route}` as any,
                    )
                  }
                  className="flex-1 mx-1 bg-primary/5 border border-border px-2 py-4 rounded-2xl"
                >
                  <Ionicons name={item.icon} size={20} color="#4F46E5" />

                  <Text
                    className="text-textPrimary font-semibold mt-2 text-xs"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {item.label}
                  </Text>

                  <Text className="text-textSecondary text-xs mt-1">
                    {item.count || 0}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ALERTS */}
        {!isDeleted && isRejected && (
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-5">
            <Text className="text-red-600 font-semibold mb-1">
              Rejection Reason
            </Text>
            <Text className="text-red-700 text-sm">
              {course.rejectionReason || "No reason provided"}
            </Text>
          </View>
        )}

        {isDeleted && (
          <View className="bg-border p-3 rounded-xl mb-5">
            <Text className="text-textSecondary text-sm">
              This course has been removed.
            </Text>
          </View>
        )}

        {/* ACTIONS */}
        {!isDeleted && (
          <View className="mb-10">
            <Text className="text-textPrimary font-semibold mb-3">Actions</Text>

            {/* APPROVE */}
            <Pressable
              onPress={() =>
                Alert.alert("Approve Course", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Approve", onPress: () => updateStatus("approved") },
                ])
              }
              className="bg-green-50 border border-green-200 py-3 rounded-xl mb-3"
            >
              <Text className="text-green-700 text-center font-semibold">
                Approve Course
              </Text>
            </Pressable>

            {/* REJECT */}
            <Pressable
              onPress={() => setRejectModal(true)}
              className="bg-red-50 border border-red-200 py-3 rounded-xl mb-3"
            >
              <Text className="text-red-600 text-center font-semibold">
                Reject Course
              </Text>
            </Pressable>

            {/* DELETE */}
            <Pressable
              onPress={() =>
                Alert.alert("Delete Course", "This cannot be undone", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: deleteCourse,
                  },
                ])
              }
              className="bg-surface border border-border py-3 rounded-xl"
            >
              <Text className="text-textPrimary text-center font-semibold">
                Delete Course
              </Text>
            </Pressable>
          </View>
        )}

        {/* REJECT MODAL */}
        <Modal visible={rejectModal} transparent animationType="slide">
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-white p-5 rounded-t-3xl">
              <Text className="text-lg font-bold mb-3">Rejection Reason</Text>

              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Enter reason..."
                multiline
                className="border border-gray-300 rounded-xl p-3 mb-4"
              />

              <Pressable
                onPress={() => {
                  updateStatus("rejected", rejectReason);
                  setRejectModal(false);
                  setRejectReason("");
                }}
                className="bg-red-500 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Submit
                </Text>
              </Pressable>

              <Pressable onPress={() => setRejectModal(false)} className="mt-2">
                <Text className="text-center text-gray-500">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
