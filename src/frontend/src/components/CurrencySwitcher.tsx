import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Currency } from "../types";
import { CURRENCIES } from "../utils/currency";

interface Props {
  value: Currency;
  onChange: (c: Currency) => void;
}

export function CurrencySwitcher({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Currency)}>
      <SelectTrigger
        data-ocid="currency.select"
        className="h-8 w-[110px] text-xs bg-muted border-border"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-xs">
            {c.symbol} {c.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
