import React from "react";
import { ModelInfo } from "../types/venice";

export function ModelSelect({
  value,
  models,
  onChange,
  id,
}: {
  value: string;
  models: ModelInfo[];
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface/60 border border-border/50 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
    >
      {(models || []).map((m) => (
        <option key={m.id} value={m.id}>
          {m.id}
        </option>
      ))}
    </select>
  );
}
