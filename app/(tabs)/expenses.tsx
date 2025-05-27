import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptySearchState } from "../../components/EmptySearchState";
import { useAuth } from "../context/AuthContext";
import { Expense, expensesAPI } from "../services/api";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchExpenses = async (retryAttempt = 0) => {
    try {
      setIsLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(data);
      setError("");
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error("Error fetching expenses:", err);

      // Check if it's a rate limit error
      if (err?.response?.status === 429 && retryAttempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt);
        setError(`Rate limit reached. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        return fetchExpenses(retryAttempt + 1);
      }

      // Handle other errors
      if (err?.response?.status === 429) {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to fetch expenses. Please try again.");
      }
      setRetryCount(retryAttempt);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh expenses when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchExpenses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleExpensePress = (expense: Expense) => {
    router.push({
      pathname: "/expenses/[id]",
      params: { id: expense.id },
    });
  };

  const handleRetry = () => {
    fetchExpenses(retryCount);
  };

  const handleAddExpense = async () => {
    if (!user) {
      setError("You must be logged in to add expenses");
      return;
    }

    try {
      const newExpense = await expensesAPI.create({
        name: "New Expense",
        amount: "0",
        description: "Click to edit",
        userId: user.id,
      });
      setExpenses([newExpense, ...expenses]);
      // Force refresh dashboard
      router.replace("/(tabs)");
    } catch (err) {
      setError("Failed to add expense");
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;

    const query = searchQuery.toLowerCase().trim();
    return expenses.filter((expense) => {
      const nameMatch = expense.name.toLowerCase().includes(query);
      const amountMatch = expense.amount.toString().includes(query);
      const descriptionMatch =
        expense.description?.toLowerCase().includes(query) || false;

      return nameMatch || amountMatch || descriptionMatch;
    });
  }, [expenses, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Expenses
          </Text>

          {/* Search Bar */}
          <View className="mb-4">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
              <FontAwesome name="search" size={16} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-800"
                placeholder="Search by name, amount, or description..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  className="p-2"
                >
                  <FontAwesome name="times-circle" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              {error && <Text className="text-gray-600 mt-4">{error}</Text>}
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-red-500 mb-4">{error}</Text>
              <TouchableOpacity
                onPress={handleRetry}
                className="bg-blue-600 px-4 py-2 rounded"
              >
                <Text className="text-white">
                  {retryCount < MAX_RETRIES ? "Retry" : "Try Again"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredExpenses.length === 0 ? (
            searchQuery ? (
              <EmptySearchState searchQuery={searchQuery} />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-600 mb-4">No expenses found</Text>
                <TouchableOpacity
                  onPress={handleAddExpense}
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  <Text className="text-white">Add Expense</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <FlatList
              data={filteredExpenses}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleExpensePress(item)}
                  className="bg-white p-6 rounded-xl mb-4 active:opacity-80 border border-gray-200 border-b-6 border-b-green-500"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                        <FontAwesome
                          name="shopping-cart"
                          size={24}
                          color="#22c55e"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-800 mb-2">
                          {item.name}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        {item.description && (
                          <Text className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-2xl font-bold text-gray-800 mb-2">
                        $
                        {Number(item.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <View className="bg-green-100 px-3 py-1.5 rounded-full">
                        <Text className="text-xs font-medium text-green-800">
                          {item.name.split(" ")[0]}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
