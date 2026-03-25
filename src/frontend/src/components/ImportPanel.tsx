import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../types";
import { parseUpiText } from "../utils/parser";

interface Props {
  onImport: (txns: Transaction[]) => void;
  onAddManually: () => void;
}

export function ImportPanel({ onImport, onAddManually }: Props) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{
    count: number;
    errors: string[];
  } | null>(null);

  const handleParse = () => {
    if (!text.trim()) {
      toast.error("Paste some UPI transaction text first");
      return;
    }
    const result = parseUpiText(text);
    setStatus({ count: result.count, errors: result.errors });
    if (result.transactions.length > 0) {
      onImport(result.transactions);
      toast.success(
        `Imported ${result.count} transaction${result.count !== 1 ? "s" : ""}`,
      );
      setText("");
    } else {
      toast.error("No transactions found. Check the format.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-card border border-border rounded-lg p-5"
      data-ocid="import.panel"
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Import UPI Statements
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Paste raw text from BHIM, GPay, PhonePe, or any UPI app.
      </p>

      <Label
        htmlFor="import-textarea"
        className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-1.5 block"
      >
        Transaction Text
      </Label>
      <Textarea
        id="import-textarea"
        data-ocid="import.textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mar 26, 2025\n01:39 PM\nPaid to Swiggy\nTransaction ID : 123456789012\nUTR No : 123456789012\nDebited from XX1234\nDebit INR 249.00"
        className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 text-xs font-mono resize-y mb-3"
      />

      {status && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3"
        >
          {status.count > 0 && (
            <p className="text-xs text-success mb-1">
              ✓ {status.count} transaction{status.count !== 1 ? "s" : ""} parsed
              successfully
            </p>
          )}
          {status.errors.map((e) => (
            <p key={e} className="text-xs text-destructive">
              ✗ {e}
            </p>
          ))}
        </motion.div>
      )}

      <Button
        data-ocid="import.submit_button"
        onClick={handleParse}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10 mb-3"
      >
        Parse &amp; Import
      </Button>

      <div className="flex items-center gap-3 mb-3">
        <div className="h-[1px] flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">Or</span>
        <div className="h-[1px] flex-1 bg-border" />
      </div>

      <Button
        data-ocid="import.add_manually_button"
        variant="outline"
        onClick={onAddManually}
        className="w-full bg-secondary border-border text-foreground hover:bg-accent h-10 font-semibold"
      >
        Add Manually
      </Button>
    </motion.div>
  );
}
