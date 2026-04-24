import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ResultScreen() {
  const { score, total, correct, courseId } = useLocalSearchParams();
  const router = useRouter();

  // ✅ Convert to number
  const numericScore = Number(score);
  const numericTotal = Number(total);

  // ✅ Calculate percentage for color only
  const percent = (numericScore / numericTotal) * 100;

  const getColor = () => {
    if (percent >= 80) return "text-green-600";
    if (percent >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <View className="flex-1 justify-center items-center bg-background p-6">

      <Text className="text-2xl font-bold text-textPrimary mb-5">
        Quiz Result
      </Text>

      <Text className={`text-5xl font-bold ${getColor()}`}>
        {numericScore} / {numericTotal}  {/* ✅ marks */}
      </Text>

      <Text className="text-textSecondary mt-2">
        {correct} / {numericTotal} correct
      </Text>

      <TouchableOpacity
        className="mt-8 bg-primary px-6 py-3 rounded-xl"
        onPress={() =>
          router.replace(`/(student)/course/${courseId}/quiz`)
        }
      >
        <Text className="text-white font-semibold">
          Back to Quizzes
        </Text>
      </TouchableOpacity>
    </View>
  );
}