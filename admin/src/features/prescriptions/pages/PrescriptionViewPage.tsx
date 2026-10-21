import { useCallback, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { decodeAdminRouteKey, prescriptionViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { PrescriptionViewWorkspace } from "@/features/prescriptions/components/PrescriptionViewWorkspace";
import { usePrescriptionMutations } from "@/features/prescriptions/hooks/use-prescription-mutations";
import { prescriptionsService } from "@/features/prescriptions/services/prescriptions.service";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";

export function PrescriptionViewPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { prescriptionKey: prescriptionKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(prescriptionKeyParam);
  const { canShow, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_PRESCRIPTION);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: prescription,
    isLoading,
    isError,
    error,
    refetch,
  } = useCrudQuery({
    queryKey: ["prescriptions", "detail", routeKey ?? ""],
    queryFn: (signal) => prescriptionsService.resolveRouteKey(routeKey!, signal),
    enabled: Boolean(routeKey),
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: prescription?.prescriptionNumber,
    buildPath: prescriptionViewPath,
    enabled: Boolean(prescription),
  });

  const { deleteMutation, isDeleting } = usePrescriptionMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.prescriptions);
  }, [navigate]);

  if (!canShow && !canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admin.prescriptions} replace />;
  }

  if (!routeKey) {
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

  if (isLoading && !prescription) {
    return <LoadingState label={t.loadingMessage} className="min-h-[50vh]" />;
  }

  if (isError) {
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

  if (!prescription) {
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
      <PrescriptionViewWorkspace
        prescription={prescription}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onBack={goToList}
        onDelete={() => setIsDeleteOpen(true)}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.prescriptionDeleteTitle}
        description={t.prescriptionDeleteDescription}
        confirmLabel={t.deleteAction}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={async () => {
          const result = await deleteMutation.mutate(prescription);
          if (result.ok) {
            setIsDeleteOpen(false);
            navigate(ROUTES.admin.prescriptions);
          }
        }}
      />
    </>
  );
}
