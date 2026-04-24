import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { api } from "@/services/api";
import { Alert } from "react-native";

export default function Courses() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/teacher/courses");
      setCourses(res.data);
    } catch (error) {
      console.log("❌ Failed to load courses", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const goToCourse = (id: string) => {
    router.push({
      pathname: "/(teacher)/courses/[courseId]",
      params: { courseId: id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-textSecondary mt-3">Loading your courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="px-5 pt-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-textPrimary">
            My Courses
          </Text>
          <Text className="text-textSecondary mt-1">
            Manage and organize your teaching content
          </Text>
        </View>

        {/* EMPTY */}
        {courses.length === 0 && (
          <View className="items-center mt-16">
            <Ionicons name="book-outline" size={50} color="#9CA3AF" />
            <Text className="text-textPrimary font-semibold mt-3 text-lg">
              No courses yet
            </Text>
            <Text className="text-textSecondary text-center mt-1">
              Create your first course to start teaching students
            </Text>
          </View>
        )}

        {/* CARDS */}
        {courses.map((course) => {
          const isDeleted = course.isDeleted === true;

          const isDraft = course.status === "draft";
          const isPending = course.status === "pending";
          const isApproved = course.status === "approved";
          const isRejected = course.status === "rejected";

          return (
            <TouchableOpacity
              key={course._id}
              onPress={() => {
                if (isDeleted) return;

                if (isPending) {
                  Alert.alert(
                    "Under Review",
                    "This course is currently under admin review and cannot be opened.",
                  );
                  return;
                }

                goToCourse(course._id);
              }}
              activeOpacity={isDeleted ? 1 : 0.85}
              className="bg-surface border border-border rounded-2xl mb-4 p-5"
            >
              {/* TOP */}
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-textPrimary font-bold text-xl"
                    numberOfLines={1}
                  >
                    {course.title}
                  </Text>

                  {/* STATUS (FIXED PRIORITY LOGIC) */}
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {isDeleted ? (
                      <View className="bg-gray-200 px-3 py-1 rounded-full">
                        <Text className="text-gray-600 text-xs font-semibold">
                          Deleted
                        </Text>
                      </View>
                    ) : isDraft ? (
                      <View className="bg-indigo-100 px-3 py-1 rounded-full">
                        <Text className="text-indigo-600 text-xs font-semibold">
                          Draft (Editable)
                        </Text>
                      </View>
                    ) : isPending ? (
                      <View className="bg-yellow-100 px-3 py-1 rounded-full">
                        <Text className="text-yellow-600 text-xs font-semibold">
                          Pending Review
                        </Text>
                      </View>
                    ) : isApproved ? (
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-600 text-xs font-semibold">
                          Published
                        </Text>
                      </View>
                    ) : isRejected ? (
                      <View className="bg-red-100 px-3 py-1 rounded-full">
                        <Text className="text-red-600 text-xs font-semibold">
                          Rejected (Editable)
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* MESSAGE (FIXED PRIORITY) */}
                  {isDeleted ? (
                    <Text className="text-gray-500 text-xs mt-2">
                      This course has been deleted and is no longer available.
                    </Text>
                  ) : (
                    <>
                      {isPending && (
                        <Text className="text-yellow-600 text-xs mt-2">
                          Course is under admin review. Editing locked.
                        </Text>
                      )}

                      {isApproved && (
                        <Text className="text-green-600 text-xs mt-2">
                          Course is published and locked for editing.
                        </Text>
                      )}

                      {isRejected && (
                        <Text className="text-red-600 text-xs mt-2">
                          {course.rejectionReason
                            ? `Rejected: ${course.rejectionReason.slice(0, 60)}...`
                            : "Fix issues and resubmit course."}
                        </Text>
                      )}

                      {isDraft && (
                        <Text className="text-indigo-600 text-xs mt-2">
                          You can build lessons, quizzes & assignments.
                        </Text>
                      )}
                    </>
                  )}

                  <Text className="text-indigo-500 text-xs font-medium mt-2">
                    Course
                  </Text>
                </View>

                <View className="bg-indigo-50 p-2 rounded-full">
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDeleted ? "#9CA3AF" : "#4F46E5"}
                  />
                </View>
              </View>

              {/* LINE */}
              <View className="h-[1px] bg-border my-4 opacity-60" />

              {/* DESCRIPTION */}
              <Text className="text-textSecondary text-sm leading-5">
                {course.description?.trim()
                  ? course.description
                  : "No description added yet."}
              </Text>

              {/* FOOTER */}
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-textSecondary text-xs">
                  {isDeleted
                    ? "Removed"
                    : isDraft
                      ? "Editable"
                      : isRejected
                        ? "Fix & Resubmit"
                        : isPending
                          ? "Locked"
                          : "View"}
                </Text>

                {!isDeleted ? (
                  <View className="bg-indigo-50 px-2 py-1 rounded-md">
                    <Text className="text-indigo-600 text-xs font-medium">
                      Open
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-100 px-2 py-1 rounded-md">
                    <Text className="text-gray-500 text-xs font-medium">
                      Removed
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
