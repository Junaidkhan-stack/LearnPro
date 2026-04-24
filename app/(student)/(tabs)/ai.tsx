import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export default function AIHelperScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi 👋 I'm your AI Study Assistant.\n\nAsk me anything about your course.",
      sender: "ai",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  /* ================= CHAT HISTORY LOAD (ADDED ONLY) ================= */
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const res = await api.get("/ai/chat");

        if (res.data?.messages) {
          const formatted = res.data.messages.map((m: any) => ({
            id: m._id,
            text: m.text || m.content,
            sender: m.role === "user" ? "user" : "ai",
          }));

          setMessages([
            {
              id: "1",
              text: "Hi 👋 I'm your AI Study Assistant.\n\nAsk me anything about your course.",
              sender: "ai",
            },
            ...formatted,
          ]);
        }
      } catch (err) {
        console.log("Chat history load error:", err);
      }
    };

    loadChatHistory();
  }, []);

  /* ================= SEND MESSAGE (UNCHANGED) ================= */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: currentInput,
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: res.data.reply,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "AI is not responding right now. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">

            {/* HEADER */}
            <View className="px-5 pt-4 pb-2">
              <Text className="text-xl font-bold text-foreground">
                AI Study Assistant
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Ask anything about your course
              </Text>
            </View>

            {/* CHAT */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 10,
              }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isUser = item.sender === "user";

                return (
                  <View
                    className={`mb-3 ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <View
                      className={`px-4 py-3 max-w-[80%] rounded-2xl ${
                        isUser
                          ? "bg-primary rounded-tr-md"
                          : "bg-surface border border-border rounded-tl-md"
                      }`}
                    >
                      <Text
                        className={`${
                          isUser ? "text-white" : "text-foreground"
                        }`}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />

            {/* INPUT */}
            <View className="border-t border-border bg-background px-4 py-3">
              <View className="flex-row items-center bg-surface border border-border rounded-2xl px-3 py-2">

                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask something..."
                  className="flex-1 text-foreground"
                  multiline
                />

                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={loading}
                  className={`ml-2 p-3 rounded-xl ${
                    loading ? "bg-gray-400" : "bg-primary"
                  }`}
                >
                  <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>

              </View>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}