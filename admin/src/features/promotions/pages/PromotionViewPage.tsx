import { useNavigate, useParams } from "react-router";

import { decodeAdminRouteKey, promotionEditPath, promotionViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { PromotionViewWorkspace } from "@/features/promotions/components/PromotionViewWorkspace";
import { usePromotionMutations } from "@/features/promotions/hooks/use-promotion-mutations";
import { promotionsService } from "@/features/promotions/services/promotions.service";
import { AppButton, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { CrudDeleteDialog, useCrudDialog, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function PromotionViewPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { promotionKey: promotionKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(promotionKeyParam);
  const isValidKey = Boolean(routeKey);
  const { canUpdate, canDelete, canShow } = useCrudPermissions(PERMISSIONS.MANAGE_PROMOTION);
  const { canUpdate: canManageBogo } = useCrudPermissions(PERMISSIONS.MANAGE_BOGO_PROMOTION);
  const dialog = useCrudDialog();

  const {
    data: promotion,
    isLoading,
    isError,
    error,
    refetch,
  } = useCrudQuery({
    queryKey: ["promotions", "detail", routeKey ?? ""],
    queryFn: (signal) => promotionsService.resolveRouteKey(routeKey!, signal),
    enabled: isValidKey && canShow,
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: promotion?.code,
    buildPath: promotionViewPath,
    enabled: Boolean(promotion?.code),
  });

  const { deleteMutation, isDeleting } = usePromotionMutations({
    onSuccess: async () => {
      dialog.close();
      navigate(ROUTES.admin.promotions);
    },
  });

  if (!isValidKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.promotionNotFound}
          action={
            <AppButton
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.admin.promotions)}
            >
              {t.backToPromotions}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (isLoading && !promotion) {
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

  if (!promotion) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.promotionNotFound}
          action={
            <AppButton
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.admin.promotions)}
            >
              {t.backToPromotions}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <PromotionViewWorkspace
        promotion={promotion}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canManageDeals={canManageBogo || canUpdate}
        onBack={() => navigate(ROUTES.admin.promotions)}
        onEdit={() => navigate(promotionEditPath(promotion))}
        onDelete={() => dialog.openDelete(promotion)}
      />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        entityLabel={formatBilingualLabel(
          getBilingualTitle(promotion.translations, promotion.code),
        )}
        isLoading={isDeleting}
        onConfirm={() => {
          void deleteMutation.mutate(promotion);
        }}
      />
    </>
  );
}
