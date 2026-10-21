import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router";

import { couponEditPath, decodeAdminRouteKey, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CouponForm } from "@/features/coupons/components/CouponForm";
import { useCouponMutations } from "@/features/coupons/hooks/use-coupon-mutations";
import { couponsService } from "@/features/coupons/services/coupons.service";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCreateFormTour } from "@/shared/guidance/hooks/use-create-form-tour";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";

export function CouponFormPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { couponKey: couponKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(couponKeyParam);
  const mode = routeKey != null ? "edit" : "create";
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_COUPON);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrateKey, setHydrateKey] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const skipBlockRef = useRef(false);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  useCreateFormTour(true, mode);

  const isValidEditKey = mode === "edit" && Boolean(routeKey);

  const {
    data: coupon,
    isLoading: isCouponLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["coupons", "detail", routeKey ?? ""],
    queryFn: (signal) => couponsService.resolveRouteKey(routeKey!, signal),
    enabled: isValidEditKey,
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: coupon?.code,
    buildPath: couponEditPath,
    enabled: mode === "edit" && Boolean(coupon?.code),
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.coupons);
  }, [navigate]);

  const { save, isSaving } = useCouponMutations();

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }: { currentLocation: { pathname: string }; nextLocation: { pathname: string } }) =>
      isDirtyRef.current &&
      !skipBlockRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
    [],
  );
  const blocker = useBlocker(shouldBlock);

  const openDiscardConfirm = useCallback(() => {
    setShowDiscardConfirm(true);
  }, []);

  useEffect(() => {
    if (blocker.state === "blocked") {
      openDiscardConfirm();
    }
  }, [blocker.state, openDiscardConfirm]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const requestClose = () => {
    if (isDirty) {
      openDiscardConfirm();
      return;
    }
    goToList();
  };

  const discardAndLeave = () => {
    setShowDiscardConfirm(false);
    skipBlockRef.current = true;
    setIsDirty(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }
    goToList();
  };

  const stayOnPage = () => {
    setShowDiscardConfirm(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  if (mode === "create" && !canCreate) {
    return <Navigate to={ROUTES.admin.coupons} replace />;
  }
  if (mode === "edit" && !canUpdate) {
    return <Navigate to={ROUTES.admin.coupons} replace />;
  }
  if (mode === "edit" && !isValidEditKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.couponNotFound}
          description={t.emptyStateDefaultDescription}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCoupons}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && isCouponLoading && !coupon) {
    return <LoadingState label={t.loadingMessage} className="min-h-[50vh]" />;
  }

  if (mode === "edit" && isError) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(error, t)}
          action={
            <AppButton type="button" variant="outline" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && !coupon) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.couponNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCoupons}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <CouponForm
        mode={mode}
        entity={mode === "edit" ? coupon : null}
        hydrateKey={hydrateKey}
        isLoading={isSaving}
        onCancel={requestClose}
        onDirtyChange={setIsDirty}
        onSubmit={async (data, originalForm) => {
          const result = await save(mode, data, coupon ?? undefined, originalForm);
          if (!result) return;
          if (result.status === "skipped") {
            setIsDirty(false);
            return;
          }
          skipBlockRef.current = true;
          setIsDirty(false);
          if (mode === "create" && result.coupon?.id) {
            navigate(couponEditPath(result.coupon), { replace: true });
            return;
          }
          if (result.coupon) {
            patchData(() => result.coupon!);
          }
          setHydrateKey((current) => current + 1);
        }}
      />

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={(open) => {
          if (!open) stayOnPage();
        }}
        title={t.discardChangesTitle}
        description={t.discardChangesDescription}
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={discardAndLeave}
      />
    </>
  );
}
