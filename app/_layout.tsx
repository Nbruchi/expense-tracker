import { Redirect, Stack } from "expo-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BudgetProvider } from "./context/BudgetContext";
import "./global.css";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <BudgetProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="expenses/[id]" options={{ headerShown: false }} />
      </Stack>
    </BudgetProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
