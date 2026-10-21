import { allGuidanceConfigs } from "@/shared/guidance/configs/guidance-configs";
import type { GuidancePageId, PageGuidanceConfig } from "@/shared/guidance/types/guidance.types";

const byPageId = new Map<GuidancePageId, PageGuidanceConfig>(
  allGuidanceConfigs.map((config) => [config.pageId, config]),
);

const byRoutePath = [...allGuidanceConfigs].sort(
  (a, b) => b.routePath.length - a.routePath.length,
);

export function getGuidanceConfigByPageId(pageId: GuidancePageId): PageGuidanceConfig | undefined {
  return byPageId.get(pageId);
}

export function resolveGuidanceConfig(pathname: string): PageGuidanceConfig | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/admin") {
    return byPageId.get("dashboard");
  }
  return byRoutePath.find(
    (config) =>
      normalized === config.routePath || normalized.startsWith(`${config.routePath}/`),
  );
}
