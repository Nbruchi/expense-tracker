import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { expensesAPI } from "../services/api";

export default function AddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to add expenses");
      return;
    }

    if (!title || !amount || !description) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await expensesAPI.create({
        name: title,
        amount: amount,
        description: description,
        userId: user.id,
      });

      Alert.alert("Success", "Expense created successfully");
      router.push("/expenses");
    } catch (error) {
      Alert.alert("Error", "Failed to create expense. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Add New Expense
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2">Title</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              placeholder="Enter expense title"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2">Amount</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View>
            <Text className="text-gray-700 mb-2">Description</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg mt-6"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Adding..." : "Add Expense"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
