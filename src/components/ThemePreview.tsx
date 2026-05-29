import React from "react";
import type { Theme } from "../theme/themeTypes";
import { contrastRatio } from "../theme/contrast";

export function ThemePreview({ theme }: { theme: Theme }) {
  const t = theme.tokens;
  const warnings: string[] = [];
  const ratios = [
    { name: "Primary text / Background", fg: t.textPrimary, bg: t.background },
    { name: "Secondary text / Surface", fg: t.textSecondary, bg: t.surface },
    { name: "Accent foreground / Accent", fg: t.accentForeground, bg: t.accent },
  ];
  ratios.forEach((r) => {
    const ratio = contrastRatio(r.fg, r.bg);
    if (ratio < 4.5) {
      warnings.push(`${r.name}: ${ratio.toFixed(2)}:1 (AA: 4.5:1)`);
    }
  });

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{ background: t.background, borderColor: t.border }}
      >
        {/* Header mock */}
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <span style={{ color: t.textPrimary, fontWeight: 600 }}>Forge</span>
          <span style={{ color: t.textMuted, fontSize: 12 }}>Status</span>
        </div>
        {/* Sidebar + Content mock */}
        <div className="flex gap-2">
          <div
            className="w-1/3 rounded-lg p-2 space-y-1"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <div className="rounded px-2 py-1 text-xs" style={{ background: t.accent, color: t.accentForeground }}>
              Active
            </div>
            <div className="rounded px-2 py-1 text-xs" style={{ color: t.textSecondary }}>
              Inactive
            </div>
          </div>
          <div
            className="flex-1 rounded-lg p-2 space-y-2"
            style={{ background: t.surfaceElevated, border: `1px solid ${t.border}` }}
          >
            <div className="h-2 rounded w-3/4" style={{ background: t.textMuted }} />
            <div className="h-2 rounded w-1/2" style={{ background: t.textMuted }} />
            <div
              className="mt-2 inline-block rounded px-3 py-1 text-xs font-medium"
              style={{ background: t.accent, color: t.accentForeground }}
            >
              Button
            </div>
          </div>
        </div>
        {/* Input mock */}
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.textPrimary }}
        >
          Input text…
        </div>
        {/* Alert mock */}
        <div
          className="rounded-lg px-3 py-2 text-xs"
          style={{ background: `${t.danger}20`, border: `1px solid ${t.danger}40`, color: t.danger }}
        >
          Alert message
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning" aria-live="polite">
          <strong>Contrast warnings:</strong>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
