import { useEffect, useState } from "react";
import { OptionItem } from "./ProfileSetupForm";
import { Check } from "lucide-react";

function parseValue(value: string): OptionItem[] {
  if (!value) return [];

  try {
    const cleaned = value
      .replace(/'/g, '"')
      .replace(/"\s*:\s*"/g, '":"');

    const arr = JSON.parse(cleaned);

    const uniqueMap = new Map<string, OptionItem>();
    arr.forEach((item: any) => {
      if (item?.id && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    return Array.from(uniqueMap.values());
  } catch (e) {
    console.error("Failed to parse value:", value);
    return [];
  }
}

export function SpecializationGrid({
  options,
  value = "",
  onChange,
  viewMode = false,
}: {
  options: OptionItem[];
  value?: string;
  onChange: (selected: string) => void;
  viewMode?: boolean;
}) {
  const [selected, setSelected] = useState<OptionItem[]>([]);

  useEffect(() => {
    const items = parseValue(value)
    setSelected(items);
  }, [value]);

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const toggle = (item: OptionItem) => {
    if (viewMode) return;

    const exists = selected.some((s) => s.id === item.id);
    const updated = exists
      ? selected.filter((s) => s.id !== item.id)
      : [...selected, item];

    setSelected(updated);
    onChange(JSON.stringify(updated));
  };

  // View mode: compact read-only pills
  if (viewMode) {
    if (selected.length === 0) {
      return <p className="text-xs text-gray-400 italic">No specializations listed</p>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-[#980194]"
          >
            {s.label}
          </span>
        ))}
      </div>
    );
  }

  // Edit mode: selectable grid of all options
  return (
    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
      {options.map((s) => {
        const active = isSelected(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
              ${active
                ? "bg-[#980194] text-white border-transparent"
                : "bg-white border-gray-200 text-gray-600 hover:border-[#980194] hover:text-[#980194]"
              }`}
          >
            {active && <Check className="w-3 h-3" />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}