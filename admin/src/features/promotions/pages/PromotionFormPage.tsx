import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router";

import { decodeAdminRouteKey, promotionEditPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { PromotionForm } from "@/features/promotions/components/PromotionForm";
import { usePromotionMutations } from "@/features/promotions/hooks/use-promotion-mutations";
import { promotionsService } from "@/features/promotions/services/promotions.service";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";

export function PromotionFormPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { promotionKey: promotionKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(promotionKeyParam);
  const mode = routeKey != null ? "edit" : "create";
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PROMOTION);
  const { canUpdate: canManageBogo } = useCrudPermissions(PERMISSIONS.MANAGE_BOGO_PROMOTION);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrateKey, setHydrateKey] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const skipBlockRef = useRef(false);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  const isValidEditKey = mode === "edit" && Boolean(routeKey);

  const {
    data: promotion,
    isLoading: isPromotionLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["promotions", "detail", routeKey ?? ""],
    queryFn: (signal) => promotionsService.resolveRouteKey(routeKey!, signal),
    enabled: isValidEditKey,
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: promotion?.code,
    buildPath: promotionEditPath,
    enabled: mode === "edit" && Boolean(promotion?.code),
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.promotions);
  }, [navigate]);

  const { save, isSaving } = usePromotionMutations();

  const shouldBlock = useCallback(
    ({
      currentLocation,
      nextLocation,
    }: {
      currentLocation: { pathname: string };
      nextLocation: { pathname: string };
    }) =>
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
    return <Navigate to={ROUTES.admin.promotions} replace />;
  }
  if (mode === "edit" && !canUpdate) {
    return <Navigate to={ROUTES.admin.promotions} replace />;
  }
  if (mode === "edit" && !isValidEditKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.promotionNotFound}
          description={t.emptyStateDefaultDescription}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToPromotions}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && isPromotionLoading && !promotion) {
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

  if (mode === "edit" && !promotion) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.promotionNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToPromotions}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <PromotionForm
        mode={mode}
        entity={mode === "edit" ? promotion : null}
        hydrateKey={hydrateKey}
        isLoading={isSaving}
        canManageDeals={canManageBogo || canUpdate}
        onCancel={requestClose}
        onDirtyChange={setIsDirty}
        onDealsChanged={async () => {
          await refetch();
        }}
        onSubmit={async (data, originalForm) => {
          const result = await save(mode, data, promotion ?? undefined, originalForm);
          if (!result) return;
          if (result.status === "skipped") {
            setIsDirty(false);
            return;
          }
          skipBlockRef.current = true;
          setIsDirty(false);
          if (mode === "create" && result.promotion?.id) {
            navigate(promotionEditPath(result.promotion), { replace: true });
            return;
          }
          if (result.promotion) {
            patchData(() => result.promotion!);
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
