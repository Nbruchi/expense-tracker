import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { expensesAPI } from "../services/api";
import { validateExpense } from "../utils/validation";

export default function AddExpenseScreen() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to add expenses");
      return;
    }

    const validationError = validateExpense({ name, amount, description });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await expensesAPI.create({
        name,
        amount,
        description,
        userId: user.id,
      });
      router.replace("/(tabs)");
    } catch (err) {
      setError("Failed to create expense");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Add Expense</Text>

        <TextInput
          className="border border-gray-300 rounded p-2 mb-4"
          placeholder="Expense Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          className="border border-gray-300 rounded p-2 mb-4"
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TextInput
          className="border border-gray-300 rounded p-2 mb-4"
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

        <TouchableOpacity
          className="bg-blue-600 p-4 rounded"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-bold">Add Expense</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
