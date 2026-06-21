export interface Transaction {
  bank: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export type BankName = "Revolut" | "Bank of Ireland UK" | "Post Office MasterCard";
export type ExpenseCategory = "Groceries" | "Entertainment" | "Rates" | "Shopping" | "Utilities" | "Transport" | "Education" | "Fees";
