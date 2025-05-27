import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Profile</Text>

        <View className="bg-white shadow-card p-4 rounded-lg mb-6 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            {user?.username.split("@")[0]}
          </Text>
          <Text className="text-gray-600">{user?.username}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-600 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
