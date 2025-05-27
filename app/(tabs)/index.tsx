import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useBudget } from "../context/BudgetContext";
import { Expense, expensesAPI } from "../services/api";

const ITEMS_PER_PAGE = 5;
const BUDGET_ALERT_THRESHOLD = 10;

const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0.00";
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function DashboardScreen() {
  const {
    monthlyBudget,
    setMonthlyBudget,
    totalExpenses,
    setTotalExpenses,
    remainingBudget,
  } = useBudget();
  const { user } = useAuth();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState("");
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [visibleCategories, setVisibleCategories] = useState(ITEMS_PER_PAGE);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchExpenses();
      }
    }, [user])
  );

  useEffect(() => {
    if (remainingBudget <= BUDGET_ALERT_THRESHOLD && remainingBudget > 0) {
      Alert.alert(
        "Budget Alert",
        `Your remaining budget is $${formatCurrency(
          remainingBudget
        )}. Consider reducing your expenses.`,
        [{ text: "OK" }]
      );
    }
  }, [remainingBudget]);

  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAll();
      // Filter expenses for current user
      const userExpenses = data.filter(
        (expense) => expense.userId === user?.id
      );
      setExpenses(userExpenses);

      // Calculate total expenses for current user
      const total = userExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );
      setTotalExpenses(total);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const handleSetBudget = async () => {
    try {
      setError("");
      const budgetValue = parseFloat(newBudget);
      if (isNaN(budgetValue) || budgetValue < 0) {
        setError("Please enter a valid budget amount");
        return;
      }
      await setMonthlyBudget(budgetValue.toString());
      setIsEditingBudget(false);
      setNewBudget("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set budget");
    }
  };

  // Calculate spending by category (using expense name as category for now)
  const spendingByCategory = expenses.reduce((acc, expense) => {
    const category = expense.name.split(" ")[0]; // Simple categorization
    const amount = Number(expense.amount || 0);
    if (!isNaN(amount)) {
      acc[category] = (acc[category] || 0) + amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, visibleCategories);

  const handleShowMore = () => {
    setVisibleCategories((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCategories(ITEMS_PER_PAGE);
  };

  const budgetPercentage =
    monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Dashboard
          </Text>

          {/* Budget Section */}
          <View className="bg-white shadow-card p-4 rounded-lg mb-6 border border-gray-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Monthly Budget
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingBudget(!isEditingBudget)}
                className="p-2"
              >
                <FontAwesome
                  name={isEditingBudget ? "times" : "edit"}
                  size={20}
                  color="#1e293b"
                />
              </TouchableOpacity>
            </View>

            {isEditingBudget ? (
              <View>
                <TextInput
                  className="bg-white p-2 rounded border border-gray-200 mb-2"
                  placeholder="Enter monthly budget"
                  keyboardType="numeric"
                  value={newBudget}
                  onChangeText={setNewBudget}
                />
                {error ? (
                  <Text className="text-red-500 mb-2">{error}</Text>
                ) : null}
                <TouchableOpacity
                  onPress={handleSetBudget}
                  className="bg-blue-600 p-2 rounded"
                >
                  <Text className="text-white text-center">Save Budget</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-3xl font-bold text-gray-800">
                ${formatCurrency(monthlyBudget)}
              </Text>
            )}
          </View>

          {/* Summary Cards */}
          <View className="flex-row mb-6">
            <View className="bg-white shadow-card p-4 rounded-lg flex-1 mr-2 border border-gray-200">
              <Text className="text-gray-600 mb-1">Total Expenses</Text>
              <Text className="text-2xl font-bold text-gray-800">
                ${formatCurrency(totalExpenses)}
              </Text>
            </View>
            <View className="bg-white shadow-card p-4 rounded-lg flex-1 ml-2 border border-gray-200">
              <Text className="text-gray-600 mb-1">Budget Left</Text>
              <Text className="text-2xl font-bold text-gray-800">
                ${formatCurrency(remainingBudget)}
              </Text>
            </View>
          </View>

          {/* Budget Progress */}
          <View className="bg-white shadow-card p-4 rounded-lg mb-6 border border-gray-200">
            <Text className="text-gray-800 mb-2">Budget Usage</Text>
            <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <View
                className={`h-full ${
                  budgetPercentage > 100 ? "bg-red-500" : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </View>
            <Text className="text-gray-600 mt-2">
              {budgetPercentage.toFixed(0)}% of budget used
            </Text>
          </View>

          {/* Spending by Category */}
          <View className="bg-white shadow-card p-4 rounded-lg border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Spending by Category
            </Text>
            {sortedCategories.map(([category, amount]) => (
              <View key={category} className="flex-row justify-between mb-2">
                <Text className="text-gray-600">{category}</Text>
                <Text className="text-gray-800 font-semibold">
                  ${formatCurrency(amount)}
                </Text>
              </View>
            ))}
            {Object.keys(spendingByCategory).length > visibleCategories ? (
              <TouchableOpacity
                onPress={handleShowMore}
                className="mt-2 bg-gray-50 p-2 rounded-lg"
              >
                <Text className="text-gray-600 text-center">Show More</Text>
              </TouchableOpacity>
            ) : visibleCategories > ITEMS_PER_PAGE ? (
              <TouchableOpacity
                onPress={handleShowLess}
                className="mt-2 bg-gray-50 p-2 rounded-lg"
              >
                <Text className="text-gray-600 text-center">Show Less</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
