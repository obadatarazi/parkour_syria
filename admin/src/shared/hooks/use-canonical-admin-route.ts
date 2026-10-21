import { useEffect } from "react";
import { useNavigate } from "react-router";

import { isNumericAdminRouteKey } from "@/shared/lib/routing/admin-route-keys.utils";

type UseCanonicalAdminRouteOptions = {
  routeKey: string | null;
  canonicalKey: string | null | undefined;
  buildPath: (canonicalKey: string) => string;
  enabled?: boolean;
};

/** Replaces legacy numeric URLs with ref-number / slug / code paths once the entity is loaded. */
export function useCanonicalAdminRoute({
  routeKey,
  canonicalKey,
  buildPath,
  enabled = true,
}: UseCanonicalAdminRouteOptions) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled || !routeKey || !canonicalKey?.trim()) return;
    const canonical = canonicalKey.trim();
    if (routeKey === canonical) return;
    if (!isNumericAdminRouteKey(routeKey)) return;
    navigate(buildPath(canonical), { replace: true });
  }, [buildPath, canonicalKey, enabled, navigate, routeKey]);
}
