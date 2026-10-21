import { useCallback, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { decodeAdminRouteKey, productViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { ProductViewWorkspace } from "@/features/products/components/ProductViewWorkspace";
import {
  type ProductQuickToggleField,
  useProductMutations,
} from "@/features/products/hooks/use-product-mutations";
import { productsService } from "@/features/products/services/products.service";
import { AppButton, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { CrudDeleteDialog, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";
import { getProductRouteKey } from "@/shared/lib/routing/admin-route-keys.utils";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function ProductViewPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { productKey: productKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(productKeyParam);
  const { canShow, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_PRODUCT);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [togglingField, setTogglingField] = useState<ProductQuickToggleField | null>(null);

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["products", "detail", routeKey ?? ""],
    queryFn: (signal) => productsService.resolveRouteKey(routeKey!, signal),
    enabled: Boolean(routeKey),
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: product ? getProductRouteKey(product) : undefined,
    buildPath: productViewPath,
    enabled: Boolean(product),
  });

  const { deleteMutation, quickToggle, isDeleting } = useProductMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.products);
  }, [navigate]);

  const handleToggle = async (field: ProductQuickToggleField, value: boolean) => {
    if (!product) return;
    setTogglingField(field);
    patchData((current) => ({ ...current, [field]: value }));
    try {
      await quickToggle(product, field, value);
    } finally {
      setTogglingField(null);
    }
  };

  if (!canShow && !canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admin.products} replace />;
  }

  if (!routeKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.productNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToProducts}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (isLoading && !product) {
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

  if (!product) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.productNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToProducts}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <ProductViewWorkspace
        product={product}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onBack={goToList}
        onDelete={() => setIsDeleteOpen(true)}
        onToggle={(field, value) => void handleToggle(field, value)}
        isToggleLoading={(field) => togglingField === field}
      />

      <CrudDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`${t.productMoveToTrashConfirm}: ${formatBilingualLabel(getBilingualTitle(product.translations, product.title))}`}
        description={t.productMoveToTrashDescription}
        confirmLabel={t.productMoveToTrashConfirm}
        isLoading={isDeleting}
        onConfirm={async () => {
          const result = await deleteMutation.mutate(product);
          if (result.ok) {
            setIsDeleteOpen(false);
            navigate(ROUTES.admin.products);
          }
        }}
      />
    </>
  );
}
