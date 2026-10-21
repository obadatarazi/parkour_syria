import type { CSSProperties } from "react";

/**
 * Reads design-system CSS variables for Recharts / canvas colors.
 * Fallbacks match `theme.css` light defaults so SSR/tests stay stable.
 */
export type ChartTheme = {
  brand: string;
  accentBrand: string;
  warning: string;
  info: string;
  mutedForeground: string;
  border: string;
  card: string;
  foreground: string;
};

const FALLBACKS: ChartTheme = {
  brand: "#c8102e",
  accentBrand: "#a00d25",
  warning: "#d97706",
  info: "#2563eb",
  mutedForeground: "#717182",
  border: "rgba(0, 0, 0, 0.1)",
  card: "#ffffff",
  foreground: "#0a0a0a",
};

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function getChartTheme(): ChartTheme {
  return {
    brand: readCssVar("--brand", FALLBACKS.brand),
    accentBrand: readCssVar("--accent-brand", FALLBACKS.accentBrand),
    warning: readCssVar("--warning", FALLBACKS.warning),
    info: readCssVar("--info", FALLBACKS.info),
    mutedForeground: readCssVar("--muted-foreground", FALLBACKS.mutedForeground),
    border: readCssVar("--border", FALLBACKS.border),
    card: readCssVar("--card", FALLBACKS.card),
    foreground: readCssVar("--foreground", FALLBACKS.foreground),
  };
}

export function chartTooltipStyle(theme: ChartTheme): CSSProperties {
  return {
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    background: theme.card,
    color: theme.foreground,
    fontSize: 12,
  };
}
