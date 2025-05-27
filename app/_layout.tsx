import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { BudgetProvider } from "./context/BudgetContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="expenses/[id]" />
        </Stack>
      </BudgetProvider>
    </AuthProvider>
  );
}
