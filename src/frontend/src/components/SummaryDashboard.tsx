import { Activity, Gamepad2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { Currency, Transaction } from "../types";
import {
  convertFromINR,
  formatAmount,
  getCurrencyInfo,
} from "../utils/currency";
import { AnimatedCounter } from "./AnimatedCounter";

interface Props {
  transactions: Transaction[];
  currency?: Currency;
}

const INR_TO_ROBUX = 1000 / 380; // 380 INR = 1,000 Robux

export function SummaryDashboard({ transactions, currency = "INR" }: Props) {
  const currInfo = getCurrencyInfo(currency);

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalCredits - totalDebits;
  const totalRobux = Math.round(totalCredits * INR_TO_ROBUX);

  const cvt = (v: number) => convertFromINR(v, currInfo);

  const cards = [
    {
      label: "TOTAL CREDITS",
      value: cvt(totalCredits),
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "TOTAL DEBITS",
      value: cvt(totalDebits),
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "NET BALANCE",
      value: cvt(Math.abs(netBalance)),
      icon: TrendingUp,
      color: netBalance >= 0 ? "text-success" : "text-destructive",
      bg: netBalance >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      label: "TRANSACTIONS",
      value: transactions.length,
      icon: Activity,
      color: "text-foreground",
      bg: "bg-muted",
      isCount: true,
    },
    {
      label: "TOTAL ROBUX",
      value: totalRobux,
      icon: Gamepad2,
      color: "text-[#00b06f]",
      bg: "bg-[#00b06f]/10",
      isRobux: true,
    },
  ];

  return (
    <section data-ocid="dashboard.section" className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border">
          {transactions.length} transactions
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            data-ocid="dashboard.card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="bg-card border border-border rounded-lg p-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                {card.label}
              </p>
              <div className={`p-1.5 rounded-md ${card.bg}`}>
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold font-display ${card.color}`}>
              {card.isCount || card.isRobux ? (
                <>
                  {card.isRobux && <span className="text-base mr-0.5">R$</span>}
                  <AnimatedCounter value={card.value} decimals={0} />
                </>
              ) : (
                <>
                  <span className="text-base mr-0.5">{currInfo.symbol}</span>
                  <AnimatedCounter
                    value={card.value}
                    decimals={currInfo.decimals}
                  />
                </>
              )}
            </p>
            {card.isRobux && (
              <p className="text-[9px] text-muted-foreground mt-1">
                380 INR = 1,000 R$
              </p>
            )}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[1px] ${card.color} opacity-20`}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
