import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { validateBudget } from "../utils/validation";

interface BudgetContextType {
  monthlyBudget: number;
  setMonthlyBudget: (amount: string) => Promise<void>;
  totalExpenses: number;
  setTotalExpenses: (amount: number) => void;
  remainingBudget: number;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [monthlyBudget, setMonthlyBudgetState] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const storedBudget = await AsyncStorage.getItem("monthlyBudget");
      if (storedBudget) {
        setMonthlyBudgetState(Number(storedBudget));
      }
    } catch (error) {
      console.error("Error loading budget:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMonthlyBudget = async (amount: string) => {
    const error = validateBudget(amount);
    if (error) {
      throw new Error(error);
    }

    const budgetAmount = Number(amount);
    try {
      await AsyncStorage.setItem("monthlyBudget", amount);
      setMonthlyBudgetState(budgetAmount);
    } catch (error) {
      console.error("Error saving budget:", error);
      throw new Error("Failed to save budget");
    }
  };

  const remainingBudget = monthlyBudget - totalExpenses;

  return (
    <BudgetContext.Provider
      value={{
        monthlyBudget,
        setMonthlyBudget,
        totalExpenses,
        setTotalExpenses,
        remainingBudget,
        isLoading,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export default BudgetProvider;

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
