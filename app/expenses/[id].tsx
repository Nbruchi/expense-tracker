import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense, expensesAPI } from "../services/api";

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExpenseDetails = async () => {
    try {
      const data = await expensesAPI.getById(id as string);
      setExpense(data);
      setEditedExpense(data);
    } catch (err) {
      setError("Failed to load expense details");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await expensesAPI.delete(id as string);
              router.replace("/(tabs)");
            } catch (err) {
              Alert.alert("Error", "Failed to delete expense");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!editedExpense) return;

    try {
      await expensesAPI.update(id as string, editedExpense);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", "Failed to update expense");
      console.error(err);
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

  if (error || !expense || !editedExpense) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4">
          <Text className="text-red-500 text-center">
            {error || "Expense not found"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <FontAwesome name="arrow-left" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="p-2 mr-2"
            >
              <FontAwesome
                name={isEditing ? "times" : "edit"}
                size={24}
                color="#2563eb"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="p-2"
              testID="delete-button"
            >
              <FontAwesome name="trash" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-gray-50 p-6 rounded-lg">
          {isEditing ? (
            <>
              <TextInput
                className="text-2xl font-bold text-gray-800 mb-4 bg-white p-2 rounded"
                value={editedExpense.name}
                onChangeText={(text) =>
                  setEditedExpense({ ...editedExpense, name: text })
                }
              />

              <View className="mb-6">
                <Text className="text-gray-600 mb-1">Amount</Text>
                <TextInput
                  className="text-3xl font-bold text-blue-600 bg-white p-2 rounded"
                  value={editedExpense.amount}
                  onChangeText={(text) =>
                    setEditedExpense({ ...editedExpense, amount: text })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-600 mb-1">Description</Text>
                <TextInput
                  className="text-gray-800 text-lg bg-white p-2 rounded"
                  value={editedExpense.description}
                  onChangeText={(text) =>
                    setEditedExpense({ ...editedExpense, description: text })
                  }
                  multiline
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdate}
                className="bg-blue-600 p-4 rounded-lg mt-4"
              >
                <Text className="text-white text-center font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-gray-800 mb-4">
                {expense.name}
              </Text>

              <View className="mb-6">
                <Text className="text-gray-600 mb-1">Amount</Text>
                <Text className="text-3xl font-bold text-blue-600">
                  ${expense.amount}
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-gray-600 mb-1">Description</Text>
                <Text className="text-gray-800 text-lg">
                  {expense.description}
                </Text>
              </View>

              <View>
                <Text className="text-gray-600 mb-1">Date</Text>
                <Text className="text-gray-800">
                  {new Date(expense.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
