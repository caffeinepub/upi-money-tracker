import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Currency, Transaction } from "../types";
import {
  convertFromINR,
  formatAmount,
  getCurrencyInfo,
} from "../utils/currency";

interface Props {
  transaction: Transaction;
  index: number;
  onDelete: (id: string) => void;
  currency?: Currency;
  /** If true, show Robux amount instead */
  robuxMode?: boolean;
}

export function TransactionCard({
  transaction: t,
  index,
  onDelete,
  currency = "INR",
  robuxMode = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const isCredit = t.type === "credit";

  const currInfo = getCurrencyInfo(currency);

  let amountDisplay: string;
  if (robuxMode) {
    const robux = Math.round((t.amount / 380) * 1000);
    amountDisplay = `${robux.toLocaleString("en-IN")} R$`;
  } else {
    const converted = convertFromINR(t.amount, currInfo);
    amountDisplay = formatAmount(converted, currInfo);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 group relative"
      data-ocid={`transaction.item.${index + 1}`}
    >
      {/* Icon badge */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCredit
            ? "bg-success/15 text-success"
            : "bg-destructive/15 text-destructive"
        }`}
      >
        {isCredit ? (
          <ArrowUpRight className="w-5 h-5" />
        ) : (
          <ArrowDownLeft className="w-5 h-5" />
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-foreground truncate text-sm">
            {t.partyName}
          </p>
          <p
            className={`text-base font-bold flex-shrink-0 font-display ${
              isCredit ? "text-success" : "text-destructive"
            }`}
          >
            {isCredit ? "+" : "-"}
            {amountDisplay}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {t.date}
            {t.time ? ` · ${t.time}` : ""}
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
              isCredit
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {t.type}
          </span>
        </div>
        {(t.transactionId || t.utrNo) && (
          <div className="flex gap-3 mt-1.5">
            {t.transactionId && (
              <span className="text-[10px] text-muted-foreground">
                ID: {t.transactionId}
              </span>
            )}
            {t.utrNo && (
              <span className="text-[10px] text-muted-foreground">
                UTR: {t.utrNo}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delete button */}
      <motion.button
        data-ocid={`transaction.delete_button.${index + 1}`}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => onDelete(t.id)}
        className="flex-shrink-0 p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        aria-label="Delete transaction"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
