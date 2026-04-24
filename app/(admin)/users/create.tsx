import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CreateUser() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/admin/users/create", {
        name,
        email,
        password,
        role,
      });

      Alert.alert("Success", "User created successfully");

      router.back();
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert("Error", "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
      >

        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-textPrimary">
            Create User
          </Text>
          <Text className="text-textSecondary mt-1">
            Add a new user to the platform
          </Text>
        </View>

        {/* CARD */}
        <View className="bg-surface border border-border rounded-2xl p-5">

          {/* NAME */}
          <Text className="text-textSecondary text-xs mb-1">
            Full Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#9CA3AF"
            className="bg-background border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
          />

          {/* EMAIL */}
          <Text className="text-textSecondary text-xs mb-1">
            Email Address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-background border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
          />

          {/* PASSWORD */}
          <Text className="text-textSecondary text-xs mb-1">
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="bg-background border border-border rounded-xl px-4 py-3 mb-5 text-textPrimary"
          />

          {/* ROLE SELECTOR */}
          <Text className="text-textSecondary text-xs mb-2">
            Select Role
          </Text>

          <View className="flex-row gap-2 mb-6">

            {["student", "teacher", "admin"].map((r) => {
              const active = role === r;

              return (
                <Pressable
                  key={r}
                  onPress={() => setRole(r as any)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    active
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-background border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold capitalize ${
                      active ? "text-white" : "text-textPrimary"
                    }`}
                  >
                    {r}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* CREATE BUTTON */}
          <Pressable
            onPress={handleCreate}
            disabled={loading}
            className="bg-indigo-600 py-4 rounded-xl flex-row justify-center items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Create User
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* FOOTER NOTE */}
        <Text className="text-textSecondary text-xs text-center mt-6">
          New users will receive access based on assigned role
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}