import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* 
        Screens registered automatically:
        - login
        - signup
      */}
    </Stack>
  );
}