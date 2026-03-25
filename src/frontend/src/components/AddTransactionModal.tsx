import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (txn: Transaction) => void;
}

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function todayStr(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function nowTimeStr(): string {
  const d = new Date();
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function AddTransactionModal({ open, onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    date: todayStr(),
    time: nowTimeStr(),
    type: "debit" as "debit" | "credit",
    amount: "",
    partyName: "",
    transactionId: "",
    utrNo: "",
    account: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.partyName.trim()) {
      toast.error("Party name is required");
      return;
    }
    const amt = Number.parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    onAdd({
      id: generateId(),
      date: form.date,
      time: form.time,
      type: form.type,
      amount: amt,
      partyName: form.partyName.trim(),
      transactionId: form.transactionId.trim(),
      utrNo: form.utrNo.trim(),
      account: form.account.trim(),
    });
    toast.success("Transaction added");
    onClose();
    setForm({
      date: todayStr(),
      time: nowTimeStr(),
      type: "debit",
      amount: "",
      partyName: "",
      transactionId: "",
      utrNo: "",
      account: "",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            data-ocid="add_transaction.modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md pointer-events-auto shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">
                  Add Transaction
                </h2>
                <button
                  type="button"
                  data-ocid="add_transaction.close_button"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type toggle */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
                    Type
                  </Label>
                  <div
                    className="flex gap-2"
                    data-ocid="add_transaction.type.toggle"
                  >
                    {(["debit", "credit"] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => set("type", t)}
                        className={`flex-1 py-2 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
                          form.type === t
                            ? t === "credit"
                              ? "bg-success/20 text-success border border-success/40"
                              : "bg-destructive/20 text-destructive border border-destructive/40"
                            : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row: date + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                      Date
                    </Label>
                    <Input
                      data-ocid="add_transaction.date.input"
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                      placeholder="Mar 26, 2025"
                      className="bg-secondary border-border text-foreground text-sm h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                      Time
                    </Label>
                    <Input
                      data-ocid="add_transaction.time.input"
                      value={form.time}
                      onChange={(e) => set("time", e.target.value)}
                      placeholder="01:39 PM"
                      className="bg-secondary border-border text-foreground text-sm h-9"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Amount (INR)
                  </Label>
                  <Input
                    data-ocid="add_transaction.amount.input"
                    type="number"
                    value={form.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="bg-secondary border-border text-foreground text-sm h-9"
                  />
                </div>

                {/* Party name */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Party Name
                  </Label>
                  <Input
                    data-ocid="add_transaction.party_name.input"
                    value={form.partyName}
                    onChange={(e) => set("partyName", e.target.value)}
                    placeholder="Swiggy, John Doe…"
                    className="bg-secondary border-border text-foreground text-sm h-9"
                  />
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                      Transaction ID
                    </Label>
                    <Input
                      data-ocid="add_transaction.txn_id.input"
                      value={form.transactionId}
                      onChange={(e) => set("transactionId", e.target.value)}
                      placeholder="Optional"
                      className="bg-secondary border-border text-foreground text-sm h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                      UTR No
                    </Label>
                    <Input
                      data-ocid="add_transaction.utr.input"
                      value={form.utrNo}
                      onChange={(e) => set("utrNo", e.target.value)}
                      placeholder="Optional"
                      className="bg-secondary border-border text-foreground text-sm h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Account (last 4 digits)
                  </Label>
                  <Input
                    data-ocid="add_transaction.account.input"
                    value={form.account}
                    onChange={(e) => set("account", e.target.value)}
                    placeholder="XX1234"
                    className="bg-secondary border-border text-foreground text-sm h-9"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  data-ocid="add_transaction.cancel_button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-secondary border-border text-foreground hover:bg-accent h-10"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="add_transaction.submit_button"
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold"
                >
                  Add Transaction
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
