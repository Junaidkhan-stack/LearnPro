import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { useState } from "react";

export default function PDFViewer() {
  const { url } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pdfUrl =
    typeof url === "string"
      ? url
      : Array.isArray(url)
      ? url[0]
      : "";

  if (!pdfUrl) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-textSecondary">No PDF URL provided</Text>
      </SafeAreaView>
    );
  }

  // ✅ Better compatibility (works for Cloudinary + direct PDF)
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    pdfUrl
  )}`;

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* LOADER */}
      {loading && (
        <View className="absolute z-10 inset-0 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      {/* ERROR */}
      {error && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Failed to load PDF</Text>
        </View>
      )}

      {/* PDF */}
      <WebView
        source={{ uri: viewerUrl }}
        style={{ flex: 1 }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        originWhitelist={["*"]}
        startInLoadingState
      />
    </SafeAreaView>
  );
}