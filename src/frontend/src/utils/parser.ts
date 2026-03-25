import type { Transaction } from "../types";

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isDateLine(line: string): boolean {
  return /^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/.test(line.trim());
}

export interface ParseResult {
  transactions: Transaction[];
  errors: string[];
  count: number;
}

export function parseUpiText(raw: string): ParseResult {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (isDateLine(line)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);

  const transactions: Transaction[] = [];
  const errors: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    try {
      const txn = parseBlock(block);
      if (txn) transactions.push(txn);
      else errors.push(`Block ${i + 1}: could not determine transaction type`);
    } catch (e) {
      errors.push(`Block ${i + 1}: ${(e as Error).message}`);
    }
  }

  return { transactions, errors, count: transactions.length };
}

function parseBlock(block: string[]): Transaction | null {
  let date = "";
  let time = "";
  let type: "debit" | "credit" | null = null;
  let partyName = "";
  let transactionId = "";
  let utrNo = "";
  let account = "";
  let amount = 0;

  for (let i = 0; i < block.length; i++) {
    const line = block[i];

    if (isDateLine(line)) {
      date = line.trim();
    } else if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(line)) {
      time = line.trim();
    } else {
      const paidTo = line.match(/^Paid to\s+(.+)$/i);
      if (paidTo) {
        partyName = paidTo[1].trim();
        type = "debit";
      } else {
        const receivedFrom = line.match(/^Received from\s+(.+)$/i);
        if (receivedFrom) {
          partyName = receivedFrom[1].trim();
          type = "credit";
        } else {
          const txnId = line.match(/^Transaction ID\s*:\s*(.+)$/i);
          if (txnId) {
            transactionId = txnId[1].trim();
          } else {
            const utr = line.match(/^UTR No\s*:\s*(.+)$/i);
            if (utr) {
              utrNo = utr[1].trim();
            } else {
              const debitedFrom = line.match(/^Debited from\s+([A-Z0-9]+)$/i);
              if (debitedFrom) {
                account = debitedFrom[1].trim();
              } else {
                const creditedTo = line.match(/^Credited to\s+([A-Z0-9]+)$/i);
                if (creditedTo) {
                  account = creditedTo[1].trim();
                } else {
                  const debitAmt = line.match(
                    /^Debit\s+INR\s*([\d,]+\.?\d*)$/i,
                  );
                  if (debitAmt) {
                    amount = Number.parseFloat(debitAmt[1].replace(/,/g, ""));
                    if (!type) type = "debit";
                  } else if (/^Debit\s+INR\s*$/i.test(line)) {
                    const nextLine = block[i + 1];
                    if (nextLine && /^[\d,]+\.?\d*$/.test(nextLine.trim())) {
                      amount = Number.parseFloat(
                        nextLine.trim().replace(/,/g, ""),
                      );
                      i++;
                    }
                    if (!type) type = "debit";
                  } else {
                    const creditAmt = line.match(
                      /^Credit\s+INR\s*([\d,]+\.?\d*)$/i,
                    );
                    if (creditAmt) {
                      amount = Number.parseFloat(
                        creditAmt[1].replace(/,/g, ""),
                      );
                      if (!type) type = "credit";
                    } else if (/^Credit\s+INR\s*$/i.test(line)) {
                      const nextLine = block[i + 1];
                      if (nextLine && /^[\d,]+\.?\d*$/.test(nextLine.trim())) {
                        amount = Number.parseFloat(
                          nextLine.trim().replace(/,/g, ""),
                        );
                        i++;
                      }
                      if (!type) type = "credit";
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (!type) return null;
  if (!date) throw new Error("Missing date");

  return {
    id: generateId(),
    date,
    time,
    type,
    amount,
    partyName: partyName || "Unknown",
    transactionId,
    utrNo,
    account,
  };
}
