import type { Transaction } from "../types";

const KEY = "upi_transactions";

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export function saveTransactions(txns: Transaction[]): void {
  localStorage.setItem(KEY, JSON.stringify(txns));
}
