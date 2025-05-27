import axios from "axios";
import { z } from "zod";
import { expenseSchema } from "../utils/validation";

const api = axios.create({
  baseURL: "https://67ac71475853dfff53dab929.mockapi.io/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      throw new Error("Request timeout. Please try again.");
    }
    if (!error.response) {
      console.error("Network error:", error);
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
);

export type User = {
  id: string;
  username: string;
  password: string;
  createdAt: string;
};

export type Expense = z.infer<typeof expenseSchema> & {
  id: string;
  createdAt: string;
};

export const authAPI = {
  login: async (username: string) => {
    const response = await api.get<User[]>(`/users?username=${username}`);
    return response.data;
  },
};

export const expensesAPI = {
  getAll: async () => {
    const response = await api.get<Expense[]>("/expenses");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  create: async (expense: Omit<Expense, "id" | "createdAt">) => {
    const response = await api.post<Expense>("/expenses", expense);
    return response.data;
  },

  update: async (id: string, expense: Partial<Expense>) => {
    const response = await api.put<Expense>(`/expenses/${id}`, expense);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/expenses/${id}`);
  },
};

export default api;
