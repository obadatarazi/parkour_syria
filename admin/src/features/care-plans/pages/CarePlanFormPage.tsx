import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router";

import { carePlanEditPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CarePlanForm } from "@/features/care-plans/components/CarePlanForm";
import { useCarePlanMutations } from "@/features/care-plans/hooks/use-care-plan-mutations";
import { carePlansService } from "@/features/care-plans/services/care-plans.service";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCreateFormTour } from "@/shared/guidance/hooks/use-create-form-tour";

export function CarePlanFormPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { carePlanId: carePlanIdParam } = useParams();
  const carePlanId = carePlanIdParam ? Number(carePlanIdParam) : null;
  const mode = carePlanId != null ? "edit" : "create";
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_CARE_PLAN);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrateKey, setHydrateKey] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const skipBlockRef = useRef(false);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  useCreateFormTour(true, mode);

  const isValidEditId =
    mode === "edit" && carePlanId != null && Number.isFinite(carePlanId) && carePlanId > 0;

  const {
    data: carePlan,
    isLoading: isCarePlanLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["care-plans", "detail", String(carePlanId ?? "")],
    queryFn: (signal) => carePlansService.getById(carePlanId!, signal),
    enabled: isValidEditId,
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.carePlans);
  }, [navigate]);

  const { save, isSaving } = useCarePlanMutations();

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
    return <Navigate to={ROUTES.admin.carePlans} replace />;
  }
  if (mode === "edit" && !canUpdate) {
    return <Navigate to={ROUTES.admin.carePlans} replace />;
  }
  if (mode === "edit" && !isValidEditId) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.carePlanNotFound}
          description={t.emptyStateDefaultDescription}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCarePlans}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && isCarePlanLoading && !carePlan) {
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

  if (mode === "edit" && !carePlan) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.carePlanNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCarePlans}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <CarePlanForm
        mode={mode}
        entity={mode === "edit" ? carePlan : null}
        hydrateKey={hydrateKey}
        isLoading={isSaving}
        onCancel={requestClose}
        onDirtyChange={setIsDirty}
        onSubmit={async (data, originalForm) => {
          const result = await save(mode, data, carePlan ?? undefined, originalForm);
          if (!result) return;
          if (result.status === "skipped") {
            setIsDirty(false);
            return;
          }
          skipBlockRef.current = true;
          setIsDirty(false);
          if (mode === "create" && result.carePlan?.id) {
            navigate(carePlanEditPath(result.carePlan.id), { replace: true });
            return;
          }
          if (result.carePlan) {
            patchData(() => result.carePlan!);
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
