import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams, useSearchParams } from "react-router";

import { prescriptionEditPath, decodeAdminRouteKey, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { PrescriptionForm } from "@/features/prescriptions/components/PrescriptionForm";
import { usePrescriptionMutations } from "@/features/prescriptions/hooks/use-prescription-mutations";
import { prescriptionsService } from "@/features/prescriptions/services/prescriptions.service";
import { parsePrescriptionFormSection } from "@/features/prescriptions/types/prescriptions.types";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCreateFormTour } from "@/shared/guidance/hooks/use-create-form-tour";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";

export function PrescriptionFormPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { prescriptionKey: prescriptionKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(prescriptionKeyParam);
  const mode = routeKey != null ? "edit" : "create";
  const parsedSection = parsePrescriptionFormSection(searchParams.get("section"));
  const initialSection = parsedSection ?? (mode === "edit" ? "products" : undefined);
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PRESCRIPTION);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrateKey, setHydrateKey] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const skipBlockRef = useRef(false);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  useCreateFormTour(true, mode);

  const isValidEditKey = mode === "edit" && Boolean(routeKey);

  const {
    data: prescription,
    isLoading: isPrescriptionLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["prescriptions", "detail", routeKey ?? ""],
    queryFn: (signal) => prescriptionsService.resolveRouteKey(routeKey!, signal),
    enabled: isValidEditKey,
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: prescription?.prescriptionNumber,
    buildPath: (canonicalKey) => prescriptionEditPath(canonicalKey, initialSection),
    enabled: mode === "edit" && Boolean(prescription),
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.prescriptions);
  }, [navigate]);

  const { save, isSaving } = usePrescriptionMutations();

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
    return <Navigate to={ROUTES.admin.prescriptions} replace />;
  }
  if (mode === "edit" && !canUpdate) {
    return <Navigate to={ROUTES.admin.prescriptions} replace />;
  }
  if (mode === "edit" && !isValidEditKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.prescriptionNotFound}
          description={t.emptyStateDefaultDescription}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToPrescriptions}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && isPrescriptionLoading && !prescription) {
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

  if (mode === "edit" && !prescription) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.prescriptionNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToPrescriptions}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <PrescriptionForm
        mode={mode}
        entity={mode === "edit" ? prescription : null}
        hydrateKey={hydrateKey}
        initialSection={initialSection}
        isLoading={isSaving}
        onCancel={requestClose}
        onDirtyChange={setIsDirty}
        onSubmit={async (data, originalForm) => {
          const result = await save(mode, data, prescription ?? undefined, originalForm);
          if (!result) return;
          if (result.status === "skipped") {
            setIsDirty(false);
            return;
          }
          skipBlockRef.current = true;
          setIsDirty(false);
          if (mode === "create" && result.prescription?.prescriptionNumber) {
            navigate(prescriptionEditPath(result.prescription.prescriptionNumber), { replace: true });
            return;
          }
          if (result.prescription) {
            patchData(() => result.prescription!);
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
