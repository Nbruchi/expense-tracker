import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const users = await authAPI.login(username);

      if (users.length > 0 && users[0].password === password) {
        await login(users[0]);
        router.replace("/(tabs)");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-green-light to-green-dark">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Welcome Back
        </Text>

        {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              placeholder="Enter your email"
              value={username}
              onChangeText={setUsername}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          <View>
            <Text className="text-gray-700 mb-2">Password</Text>
            <View className="relative">
              <TextInput
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 pr-12"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg mt-6"
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
