export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: "debit" | "credit";
  amount: number;
  partyName: string;
  transactionId: string;
  utrNo: string;
  account: string;
}

export type SortOption =
  | "date-newest"
  | "date-oldest"
  | "amount-high"
  | "amount-low"
  | "name-az"
  | "name-za";

export type FilterOption = "all" | "debit" | "credit";

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "JPY" | "AED";
