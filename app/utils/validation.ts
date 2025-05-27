import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Please enter a valid email address");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const expenseSchema = z.object({
  name: z.string().min(1, "Title is required"),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Please enter a valid amount"
    ),
  description: z.string().min(1, "Description is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const budgetSchema = z
  .string()
  .refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Please enter a valid budget amount"
  );

// Helper functions to use the schemas
export const validateEmail = (email: string): string | null => {
  const result = emailSchema.safeParse(email);
  return result.success ? null : result.error.errors[0].message;
};

export const validatePassword = (password: string): string | null => {
  const result = passwordSchema.safeParse(password);
  return result.success ? null : result.error.errors[0].message;
};

export const validateExpense = (data: {
  name: string;
  amount: string;
  description: string;
}): string | null => {
  const result = expenseSchema.safeParse(data);
  return result.success ? null : result.error.errors[0].message;
};

export const validateBudget = (amount: string): string | null => {
  const result = budgetSchema.safeParse(amount);
  return result.success ? null : result.error.errors[0].message;
};

const validationUtils = {
  validateEmail,
  validatePassword,
  validateExpense,
  validateBudget,
  emailSchema,
  passwordSchema,
  expenseSchema,
  budgetSchema,
};

export default validationUtils;
