import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router";

import { decodeAdminRouteKey, productEditPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useProductMutations } from "@/features/products/hooks/use-product-mutations";
import { productsService } from "@/features/products/services/products.service";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCreateFormTour } from "@/shared/guidance/hooks/use-create-form-tour";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";
import { getProductRouteKey } from "@/shared/lib/routing/admin-route-keys.utils";

export function ProductFormPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { productKey: productKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(productKeyParam);
  const mode = routeKey != null ? "edit" : "create";
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PRODUCT);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrateKey, setHydrateKey] = useState(0);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [discardEditLabels, setDiscardEditLabels] = useState<string[]>([]);
  const skipBlockRef = useRef(false);
  const isDirtyRef = useRef(false);
  const unsavedEditsRef = useRef<string[]>([]);
  isDirtyRef.current = isDirty;

  useCreateFormTour(true, mode);

  const isValidEditKey = mode === "edit" && Boolean(routeKey);

  const {
    data: product,
    isLoading: isProductLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["products", "detail", routeKey ?? ""],
    queryFn: (signal) => productsService.resolveRouteKey(routeKey!, signal),
    enabled: isValidEditKey,
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: product ? getProductRouteKey(product) : undefined,
    buildPath: productEditPath,
    enabled: mode === "edit" && Boolean(product),
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.products);
  }, [navigate]);

  const { save, isSaving } = useProductMutations();

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }: { currentLocation: { pathname: string }; nextLocation: { pathname: string } }) =>
      isDirtyRef.current &&
      !skipBlockRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
    [],
  );
  const blocker = useBlocker(shouldBlock);

  const openDiscardConfirm = useCallback(() => {
    setDiscardEditLabels([...unsavedEditsRef.current]);
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
    return <Navigate to={ROUTES.admin.products} replace />;
  }
  if (mode === "edit" && !canUpdate) {
    return <Navigate to={ROUTES.admin.products} replace />;
  }
  if (mode === "edit" && !isValidEditKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.productNotFound}
          description={t.emptyStateDefaultDescription}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToProducts}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && isProductLoading && !product) {
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

  if (mode === "edit" && !product) {
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
      <ProductForm
        mode={mode}
        product={mode === "edit" ? product : null}
        hydrateKey={hydrateKey}
        isLoading={isSaving}
        onCancel={requestClose}
        onDirtyChange={setIsDirty}
        unsavedEditsRef={unsavedEditsRef}
        onSubmit={async (data, originalForm) => {
          const result = await save(mode, data, product ?? undefined, originalForm);
          if (!result) return;
          if (result.status === "skipped") {
            setIsDirty(false);
            return;
          }
          skipBlockRef.current = true;
          setIsDirty(false);
          if (mode === "create" && result.product?.id) {
            navigate(productEditPath(result.product), { replace: true });
            return;
          }
          if (result.product) {
            patchData(() => result.product!);
            const nextRouteKey = getProductRouteKey(result.product);
            if (routeKey && nextRouteKey !== routeKey) {
              navigate(productEditPath(result.product), { replace: true });
            }
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
        description={
          <div className="space-y-3">
            <p>{t.discardChangesDescription}</p>
            {discardEditLabels.length > 0 ? (
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">{t.discardChangesEditsHeading}</p>
                <ul className="max-h-40 list-disc space-y-1 overflow-y-auto ps-5">
                  {discardEditLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        }
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={discardAndLeave}
      />
    </>
  );
}
