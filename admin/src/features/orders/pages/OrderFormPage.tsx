import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams, useSearchParams } from "react-router";

import { decodeAdminRouteKey, orderEditPath, orderViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { customersService } from "@/features/customers/services/customers.service";
import { OrderForm } from "@/features/orders/components/OrderForm";
import { useOrderMutations } from "@/features/orders/hooks/use-order-mutations";
import { ordersService } from "@/features/orders/services/orders.service";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCreateFormTour } from "@/shared/guidance/hooks/use-create-form-tour";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";

export function OrderFormPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orderKey: orderKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(orderKeyParam);
  const mode = routeKey != null ? "edit" : "create";
  const prefillUserIdRaw = searchParams.get("userId");
  const prefillUserId = prefillUserIdRaw ? Number(prefillUserIdRaw) : NaN;
  const shouldPrefillCustomer =
    mode === "create" && Number.isFinite(prefillUserId) && prefillUserId > 0;
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_ORDER);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrateKey, setHydrateKey] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const skipBlockRef = useRef(false);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  useCreateFormTour(true, mode);

  const isValidEditKey = mode === "edit" && Boolean(routeKey);

  const { data: prefillCustomer } = useCrudQuery({
    queryKey: ["crm-customers", "detail", String(prefillUserId || "")],
    queryFn: (signal) => customersService.getById(prefillUserId, signal),
    enabled: shouldPrefillCustomer,
  });

  const {
    data: order,
    isLoading: isOrderLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["orders", "detail", routeKey ?? ""],
    queryFn: (signal) => ordersService.resolveRouteKey(routeKey!, signal),
    enabled: isValidEditKey,
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: order?.orderRefNumber,
    buildPath: orderEditPath,
    enabled: mode === "edit" && Boolean(order),
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.orders);
  }, [navigate]);

  const { save, isSaving } = useOrderMutations();

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
    return <Navigate to={ROUTES.admin.orders} replace />;
  }
  if (mode === "edit" && !canUpdate) {
    return <Navigate to={ROUTES.admin.orders} replace />;
  }
  if (mode === "edit" && !isValidEditKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.orderNotFound}
          description={t.emptyStateDefaultDescription}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToOrders}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && isOrderLoading && !order) {
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

  if (mode === "edit" && !order) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.orderNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToOrders}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <OrderForm
        mode={mode}
        order={mode === "edit" ? order : null}
        hydrateKey={hydrateKey}
        prefillCustomer={shouldPrefillCustomer ? prefillCustomer ?? null : null}
        isLoading={isSaving}
        onCancel={requestClose}
        onDirtyChange={setIsDirty}
        onSubmit={async (data) => {
          const result = await save(mode, data, order ?? undefined);
          if (!result) return;
          if (result.status === "skipped") {
            setIsDirty(false);
            return;
          }
          skipBlockRef.current = true;
          setIsDirty(false);
          if (mode === "create" && result.order?.id) {
            // Land on the view so applied coupons, delivery fee, and amount due are visible
            // immediately (create is the only place coupons can be attached).
            navigate(orderViewPath(result.order), { replace: true });
            return;
          }
          if (result.order) {
            patchData(() => result.order!);
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
