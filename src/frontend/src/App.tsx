import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { CloudIcon, Loader2, LogIn, LogOut, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { CurrencySwitcher } from "./components/CurrencySwitcher";
import { FilterBar } from "./components/FilterBar";
import { ImportPanel } from "./components/ImportPanel";
import { SummaryDashboard } from "./components/SummaryDashboard";
import { TransactionCard } from "./components/TransactionCard";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import type { Currency, FilterOption, SortOption, Transaction } from "./types";
import { loadTransactions, saveTransactions } from "./utils/storage";

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "sample_1",
    date: "Mar 24, 2025",
    time: "09:15 AM",
    type: "debit",
    amount: 249.0,
    partyName: "Swiggy",
    transactionId: "412837465091",
    utrNo: "412837465091",
    account: "XX4321",
  },
  {
    id: "sample_2",
    date: "Mar 23, 2025",
    time: "02:40 PM",
    type: "credit",
    amount: 5000.0,
    partyName: "Rahul Sharma",
    transactionId: "398271046382",
    utrNo: "398271046382",
    account: "XX4321",
  },
  {
    id: "sample_3",
    date: "Mar 22, 2025",
    time: "11:30 AM",
    type: "debit",
    amount: 1299.0,
    partyName: "Amazon Pay",
    transactionId: "376291047382",
    utrNo: "376291047382",
    account: "XX4321",
  },
  {
    id: "sample_4",
    date: "Mar 21, 2025",
    time: "07:55 PM",
    type: "debit",
    amount: 450.0,
    partyName: "Zomato",
    transactionId: "365192837465",
    utrNo: "365192837465",
    account: "XX4321",
  },
  {
    id: "sample_5",
    date: "Mar 20, 2025",
    time: "04:22 PM",
    type: "credit",
    amount: 12000.0,
    partyName: "PhonePe Wallet",
    transactionId: "354938271046",
    utrNo: "354938271046",
    account: "XX4321",
  },
  {
    id: "sample_6",
    date: "Mar 19, 2025",
    time: "10:05 AM",
    type: "debit",
    amount: 799.0,
    partyName: "Netflix India",
    transactionId: "341827364910",
    utrNo: "341827364910",
    account: "XX4321",
  },
];

type NavTab = "dashboard" | "transactions" | "import" | "robux";

function loadCurrency(): Currency {
  try {
    const v = localStorage.getItem("upi_currency");
    if (v) return v as Currency;
  } catch {}
  return "INR";
}

function saveCurrency(c: Currency) {
  try {
    localStorage.setItem("upi_currency", c);
  } catch {}
}

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isSyncing = useRef(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = loadTransactions();
    if (stored.length === 0) {
      saveTransactions(SAMPLE_TRANSACTIONS);
      return SAMPLE_TRANSACTIONS;
    }
    return stored;
  });

  const [currency, setCurrencyState] = useState<Currency>(loadCurrency);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("date-newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Save to localStorage when not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoggedIn]);

  // Sync from backend on login
  const syncFromBackend = useCallback(async () => {
    if (!actor || actorFetching || isSyncing.current) return;
    isSyncing.current = true;
    try {
      const [backendTxns, backendCurrency] = await Promise.all([
        actor.getTransactions(),
        actor.getCurrency(),
      ]);

      const frontendTxns: Transaction[] = backendTxns.map((t) => ({
        id: t.id.toString(),
        date: t.date,
        time: t.time,
        type: t.type === "credit" ? "credit" : "debit",
        amount: t.amount,
        partyName: t.partyName,
        transactionId: t.transactionId,
        utrNo: t.utrNo,
        account: t.account,
      }));

      setTransactions(frontendTxns.length > 0 ? frontendTxns : []);

      if (backendCurrency) {
        setCurrencyState(backendCurrency as Currency);
        saveCurrency(backendCurrency as Currency);
      }

      setCloudSynced(true);
      toast.success("Cloud sync complete");
    } catch {
      toast.error("Cloud sync failed");
    } finally {
      isSyncing.current = false;
    }
  }, [actor, actorFetching]);

  useEffect(() => {
    if (isLoggedIn && actor && !actorFetching) {
      syncFromBackend();
    }
    if (!isLoggedIn) {
      setCloudSynced(false);
    }
  }, [isLoggedIn, actor, actorFetching, syncFromBackend]);

  const handleCurrencyChange = async (c: Currency) => {
    setCurrencyState(c);
    saveCurrency(c);
    if (isLoggedIn && actor) {
      try {
        await actor.setCurrency(c);
      } catch {}
    }
  };

  const addTransactions = (txns: Transaction[]) => {
    if (isLoggedIn && actor) {
      Promise.all(
        txns.map(async (txn) => {
          try {
            const backendTxn = {
              id: BigInt(0),
              date: txn.date,
              time: txn.time,
              type: txn.type,
              amount: txn.amount,
              partyName: txn.partyName,
              transactionId: txn.transactionId,
              utrNo: txn.utrNo,
              account: txn.account,
            };
            const newId = await actor.addTransaction(backendTxn);
            return { ...txn, id: newId.toString() };
          } catch {
            return txn;
          }
        }),
      ).then((saved) => {
        setTransactions((prev) => [...saved, ...prev]);
      });
    } else {
      setTransactions((prev) => [...txns, ...prev]);
    }
  };

  const addTransaction = async (txn: Transaction) => {
    if (isLoggedIn && actor) {
      try {
        const backendTxn = {
          id: BigInt(0),
          date: txn.date,
          time: txn.time,
          type: txn.type,
          amount: txn.amount,
          partyName: txn.partyName,
          transactionId: txn.transactionId,
          utrNo: txn.utrNo,
          account: txn.account,
        };
        const newId = await actor.addTransaction(backendTxn);
        setTransactions((prev) => [{ ...txn, id: newId.toString() }, ...prev]);
      } catch {
        toast.error("Failed to save transaction to cloud");
        setTransactions((prev) => [txn, ...prev]);
      }
    } else {
      setTransactions((prev) => [txn, ...prev]);
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isLoggedIn && actor) {
      try {
        await actor.deleteTransaction(BigInt(id));
      } catch {
        toast.error("Failed to delete from cloud");
      }
    }
  };

  const clearAllTransactions = async () => {
    if (!window.confirm("Clear all transactions? This cannot be undone."))
      return;
    setTransactions([]);
    if (isLoggedIn && actor) {
      try {
        await (actor as any).clearTransactions();
      } catch {
        toast.error("Failed to clear from cloud");
      }
    }
    toast.success("All transactions cleared");
  };

  const handleLogout = () => {
    clear();
    setCloudSynced(false);
    const stored = loadTransactions();
    setTransactions(stored.length > 0 ? stored : SAMPLE_TRANSACTIONS);
    setCurrencyState(loadCurrency());
    toast.success("Logged out");
  };

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filter !== "all") {
      result = result.filter((t) => t.type === filter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.partyName.toLowerCase().includes(q) ||
          t.transactionId.toLowerCase().includes(q) ||
          t.utrNo.toLowerCase().includes(q),
      );
    }

    switch (sort) {
      case "date-newest":
        result.sort((a, b) => {
          const da = new Date(`${a.date} ${a.time || "00:00 AM"}`).getTime();
          const db = new Date(`${b.date} ${b.time || "00:00 AM"}`).getTime();
          return db - da;
        });
        break;
      case "date-oldest":
        result.sort((a, b) => {
          const da = new Date(`${a.date} ${a.time || "00:00 AM"}`).getTime();
          const db = new Date(`${b.date} ${b.time || "00:00 AM"}`).getTime();
          return da - db;
        });
        break;
      case "amount-high":
        result.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-low":
        result.sort((a, b) => a.amount - b.amount);
        break;
      case "name-az":
        result.sort((a, b) => a.partyName.localeCompare(b.partyName));
        break;
      case "name-za":
        result.sort((a, b) => b.partyName.localeCompare(a.partyName));
        break;
    }

    return result;
  }, [transactions, filter, search, sort]);

  const NAV_TABS: { id: NavTab; label: string; emoji?: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "transactions", label: "Transactions" },
    { id: "import", label: "Import" },
    { id: "robux", label: "Robux", emoji: "🎮" },
  ];

  const showCurrencySwitcher = activeTab !== "robux" && activeTab !== "import";

  return (
    <div className="min-h-screen bg-background">
      <Toaster theme="dark" />
      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTransaction}
      />

      {/* Nav */}
      <header className="border-b border-border sticky top-0 z-30 bg-background/90 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <span className="font-display font-bold text-sm tracking-[0.2em] text-foreground uppercase flex-shrink-0">
            PAYTRACK
          </span>
          <nav
            className="flex gap-1 flex-1 justify-center"
            data-ocid="nav.section"
          >
            {NAV_TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                data-ocid={`nav.${tab.id}.link`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors uppercase tracking-wider flex items-center gap-1 ${
                  activeTab === tab.id
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex-shrink-0 flex items-center gap-2">
            {showCurrencySwitcher && (
              <CurrencySwitcher
                value={currency}
                onChange={handleCurrencyChange}
              />
            )}

            {/* Auth controls */}
            {isInitializing ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2">
                {cloudSynced && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                    <CloudIcon className="w-3 h-3" />
                    Synced
                  </span>
                )}
                <button
                  type="button"
                  data-ocid="auth.logout.button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="auth.login.button"
                onClick={() => login()}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-foreground text-background hover:opacity-80 transition-opacity uppercase tracking-wider disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <LogIn className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">
                  {isLoggingIn ? "Logging in..." : "Login"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10"
        >
          <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase mb-3">
            PAYTRACK
          </p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground leading-tight">
            Welcome Back.
            <br />
            <span className="text-muted-foreground">
              Track Your UPI Finances.
            </span>
          </h1>
        </motion.section>

        {/* Summary */}
        {(activeTab === "dashboard" || activeTab === "transactions") && (
          <SummaryDashboard transactions={transactions} currency={currency} />
        )}

        {/* Dashboard / Transactions tab */}
        {(activeTab === "dashboard" || activeTab === "transactions") && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Transaction List
                </h2>
                {transactions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="transaction.delete_button"
                    onClick={clearAllTransactions}
                    className="ml-auto text-red-500 border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Clear All
                  </Button>
                )}
              </div>
              <FilterBar
                search={search}
                filter={filter}
                sort={sort}
                onSearch={setSearch}
                onFilter={setFilter}
                onSort={setSort}
                onAddClick={() => setShowAddModal(true)}
              />
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <motion.div
                      data-ocid="transaction.empty_state"
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card border border-border rounded-lg p-12 text-center"
                    >
                      <p className="text-muted-foreground text-sm mb-1">
                        No transactions found
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {search || filter !== "all"
                          ? "Try clearing filters"
                          : "Import or add your first transaction"}
                      </p>
                    </motion.div>
                  ) : (
                    filtered.map((txn, i) => (
                      <TransactionCard
                        key={txn.id}
                        transaction={txn}
                        index={i}
                        onDelete={deleteTransaction}
                        currency={currency}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {activeTab === "dashboard" && (
              <div className="lg:w-[340px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Import
                  </h2>
                </div>
                <ImportPanel
                  onImport={addTransactions}
                  onAddManually={() => setShowAddModal(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Import tab */}
        {activeTab === "import" && (
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Import UPI Statements
              </h2>
            </div>
            <ImportPanel
              onImport={(txns) => {
                addTransactions(txns);
                setActiveTab("transactions");
              }}
              onAddManually={() => setShowAddModal(true)}
            />
          </div>
        )}

        {/* Robux tab */}
        {activeTab === "robux" && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                🎮 Robux View
              </h2>
              <span className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border bg-card">
                380 INR = 1,000 R$ · 4.1 USD = 1,000 R$
              </span>
            </div>

            <FilterBar
              search={search}
              filter={filter}
              sort={sort}
              onSearch={setSearch}
              onFilter={setFilter}
              onSort={setSort}
              onAddClick={() => setShowAddModal(true)}
            />

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    data-ocid="robux.empty_state"
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-lg p-12 text-center"
                  >
                    <p className="text-muted-foreground text-sm">
                      No transactions found
                    </p>
                  </motion.div>
                ) : (
                  filtered.map((txn, i) => (
                    <TransactionCard
                      key={txn.id}
                      transaction={txn}
                      index={i}
                      onDelete={deleteTransaction}
                      robuxMode
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PAYTRACK. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
