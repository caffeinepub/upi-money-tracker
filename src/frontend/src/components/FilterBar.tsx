import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import type { FilterOption, SortOption } from "../types";

const SORT_LABELS: Record<SortOption, string> = {
  "date-newest": "Date (Newest)",
  "date-oldest": "Date (Oldest)",
  "amount-high": "Amount (High → Low)",
  "amount-low": "Amount (Low → High)",
  "name-az": "Name (A → Z)",
  "name-za": "Name (Z → A)",
};

interface Props {
  search: string;
  filter: FilterOption;
  sort: SortOption;
  onSearch: (v: string) => void;
  onFilter: (v: FilterOption) => void;
  onSort: (v: SortOption) => void;
  onAddClick: () => void;
}

export function FilterBar({
  search,
  filter,
  sort,
  onSearch,
  onFilter,
  onSort,
  onAddClick,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="transaction.search_input"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search party, ID…"
          className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-1">
        {(["all", "credit", "debit"] as FilterOption[]).map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`transaction.${f}.tab`}
            onClick={() => onFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md uppercase tracking-wide transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-ocid="transaction.sort.button"
            variant="outline"
            size="sm"
            className="bg-secondary border-border text-muted-foreground hover:text-foreground h-9 text-xs gap-1"
          >
            {SORT_LABELS[sort]}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-popover border-border text-foreground"
          align="end"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => onSort(s)}
              className={`text-sm cursor-pointer ${
                sort === s
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {SORT_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add button */}
      <Button
        data-ocid="transaction.add_button"
        onClick={onAddClick}
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold"
      >
        + Add Transaction
      </Button>
    </div>
  );
}
