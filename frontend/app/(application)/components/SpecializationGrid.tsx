import { useEffect, useState } from "react";
import { OptionItem } from "./ProfileSetupForm";
import { CheckCircle2 } from "lucide-react";

function parseValue(value: string): OptionItem[] {
  if (!value) return [];

  try {
    // Convert Python-style dict strings → JSON-like
    const cleaned = value
      .replace(/'/g, '"') // convert single quotes to double quotes
      .replace(/"\s*:\s*"/g, '":"'); // safety normalize

    const arr = JSON.parse(cleaned);

    // remove duplicates by id
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

  // sync from string → objects
  useEffect(() => {
    setSelected(parseValue(value));
  }, [value]);

  const isSelected = (id: string) =>
    selected.some((s) => s.id === id);

  const toggle = (item: OptionItem) => {
    if (viewMode) return;

    const exists = selected.some((s) => s.id === item.id);

    const updated = exists
      ? selected.filter((s) => s.id !== item.id)
      : [...selected, item];

    setSelected(updated);

    // send BACK as string (same format as input)
    onChange(JSON.stringify(updated));
  };

  const displayItems = viewMode ? selected : options;

  return (
    <div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto pr-1">
      {displayItems.map((s) => {
        const active = isSelected(s.id);

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s)}
            disabled={viewMode}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${
                active
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white border-transparent shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
              }
              ${viewMode ? "cursor-default opacity-90" : ""}`}
          >
            {active && (
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
            )}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}