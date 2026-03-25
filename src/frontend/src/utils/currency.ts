import type { Currency } from "../types";

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  label: string;
  /** Rate: 1 INR = X of this currency */
  rateFromINR: number;
  decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: "INR",
    symbol: "₹",
    label: "Indian Rupee",
    rateFromINR: 1,
    decimals: 2,
  },
  {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    rateFromINR: 0.012,
    decimals: 2,
  },
  { code: "EUR", symbol: "€", label: "Euro", rateFromINR: 0.011, decimals: 2 },
  {
    code: "GBP",
    symbol: "£",
    label: "British Pound",
    rateFromINR: 0.0095,
    decimals: 2,
  },
  {
    code: "JPY",
    symbol: "¥",
    label: "Japanese Yen",
    rateFromINR: 1.78,
    decimals: 0,
  },
  {
    code: "AED",
    symbol: "د.إ",
    label: "UAE Dirham",
    rateFromINR: 0.044,
    decimals: 2,
  },
];

export function getCurrencyInfo(code: Currency): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function convertFromINR(amountINR: number, info: CurrencyInfo): number {
  return amountINR * info.rateFromINR;
}

export function formatAmount(amount: number, info: CurrencyInfo): string {
  return `${info.symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  })}`;
}

export function toRobux(amountINR: number): number {
  return Math.round((amountINR / 380) * 1000);
}
