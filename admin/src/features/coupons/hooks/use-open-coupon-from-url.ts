import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { couponViewPath } from "@/app/router/routes";
import { couponsService } from "@/features/coupons/services/coupons.service";

/**
 * Redirects `?id=` / `?code=` deep-links to the canonical coupon view path.
 */
export function useOpenCouponFromUrl(): void {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const openedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code")?.trim();
    const rawId = searchParams.get("id")?.trim();
    if (!code && !rawId) {
      openedKeyRef.current = null;
      return;
    }

    const openKey = code ? `code:${code.toUpperCase()}` : `id:${rawId}`;
    if (openedKeyRef.current === openKey) return;

    const id = rawId ? Number(rawId) : 0;
    if (!code && (!Number.isFinite(id) || id <= 0)) return;

    openedKeyRef.current = openKey;

    const next = new URLSearchParams(searchParams);
    next.delete("code");
    next.delete("id");
    setSearchParams(next, { replace: true });

    if (!code && Number.isFinite(id) && id > 0) {
      navigate(couponViewPath(String(id)), { replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const coupon = await couponsService.getByCodeOrId(code || String(id));
        if (cancelled) return;
        navigate(couponViewPath(coupon), { replace: true });
      } catch {
        openedKeyRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, setSearchParams]);
}
