import { useState } from "react";

export const SIZE_WIDTH = { min: 20, max: 400 };
export const SIZE_HEIGHT = { min: 10, max: 300 };

export function clampMm(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function MmInput({
  value,
  min,
  max,
  onCommit,
  className,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
  className?: string;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(Math.round(value));

  const commit = () => {
    const raw = (draft ?? shown).trim();
    setDraft(null);
    const n = Number(raw.replace(",", "."));
    if (!Number.isFinite(n)) return;
    onCommit(clampMm(n, min, max));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      aria-label={ariaLabel}
      value={shown}
      onFocus={() => setDraft(String(Math.round(value)))}
      onChange={(e) => {
        const next = e.target.value.replace(",", ".").replace(/[^\d.]/g, "");
        if (next === "" || /^\d{0,4}(\.\d{0,1})?$/.test(next)) {
          setDraft(next);
          const n = Number(next);
          if (Number.isFinite(n) && n >= min && n <= max && !next.endsWith(".")) {
            onCommit(clampMm(n, min, max));
          }
        }
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}
