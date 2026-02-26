"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────────────────────────────

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioGroupItem must be used inside RadioGroup");
  return ctx;
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

function RadioGroup({
  value,
  onValueChange,
  disabled = false,
  className,
  children,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <div role="radiogroup" className={cn("flex flex-col gap-3", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

// ─── RadioGroupItem ───────────────────────────────────────────────────────────

interface RadioGroupItemProps {
  value: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

function RadioGroupItem({
  value,
  label,
  className,
  labelClassName,
  disabled: itemDisabled,
}: RadioGroupItemProps) {
  const { value: groupValue, onValueChange, disabled: groupDisabled } = useRadioGroup();
  const isSelected = groupValue === value;
  const isDisabled = itemDisabled || groupDisabled;
  const id = React.useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-4 cursor-pointer group select-none",
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Hidden native radio for accessibility */}
      <input
        id={id}
        type="radio"
        value={value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => !isDisabled && onValueChange(value)}
        className="sr-only"
      />

      {/* Custom radio circle */}
      <div
        aria-hidden
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
          isSelected
            ? "border-[#980194] bg-[#980194]"
            : "border-gray-300 group-hover:border-[#980194]",
          isDisabled && "group-hover:border-gray-300"
        )}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-2.5 h-2.5 rounded-full bg-white"
          />
        )}
      </div>

      {/* Label */}
      {label && (
        <span
          className={cn(
            "text-base transition-colors duration-200",
            isSelected
              ? "text-[#980194] font-semibold"
              : "text-gray-700 group-hover:text-gray-900",
            isDisabled && "group-hover:text-gray-700",
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
export type { RadioGroupProps, RadioGroupItemProps };
