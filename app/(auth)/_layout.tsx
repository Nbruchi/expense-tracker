import { Redirect, Stack } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null;
  }

  // If user is logged in, redirect to tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#1e293b",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />
    </Stack>
  );
}
