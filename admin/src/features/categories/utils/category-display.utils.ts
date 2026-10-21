import type { Translation } from "@/shared/design-system/localization/locales/en";

export function getCategoryDepthLabel(depth: number | undefined, t: Translation): string {
  if (depth === 1) return t.filterDepth1;
  if (depth === 2) return t.filterDepth2;
  if (depth === 3) return t.filterDepth3;
  if (depth === 4) return t.filterDepth4;
  if (depth === 5) return t.filterDepth5;
  return depth != null ? `${t.filterDepth} ${depth}` : "—";
}

export function formatMessageTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}
