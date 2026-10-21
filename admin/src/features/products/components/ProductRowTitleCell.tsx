import type { Product } from "@/features/products/types/products.types";
import {
  getProductStorefrontUrlForLocale,
  formatProductStorefrontUrlForCopy,
  type StorefrontLocale,
} from "@/features/products/utils/product-storefront-url.utils";
import {
  getFeaturedProductImage,
} from "@/features/products/utils/product-display.utils";
import { BilingualText, MediaImage } from "@/shared/components";
import {
  WpRowActionButton,
  WpRowActions,
  WpRowActionSeparator,
} from "@/shared/crud/components/WpRowActions";
import { useLocalization, useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";
import { notify } from "@/shared/lib/notifications";

type ProductRowTitleCellProps = {
  product: Product;
  mode?: "active" | "trash";
  canUpdate: boolean;
  canDelete: boolean;
  canCreate: boolean;
  isDuplicating?: boolean;
  isRestoring?: boolean;
  isForceDeleting?: boolean;
  onEdit: (product: Product) => void;
  onQuickEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onRestore?: (product: Product) => void;
  onForceDelete?: (product: Product) => void;
  onOpenTitle: (product: Product) => void;
  dataGuidance?: string;
};

/**
 * WordPress-style product name cell: click title to open; secondary actions on row hover.
 */
export function ProductRowTitleCell({
  product,
  mode = "active",
  canUpdate,
  canDelete,
  canCreate,
  isDuplicating = false,
  isRestoring = false,
  isForceDeleting = false,
  onEdit,
  onQuickEdit,
  onDelete,
  onDuplicate,
  onRestore,
  onForceDelete,
  onOpenTitle,
  dataGuidance,
}: ProductRowTitleCellProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const locale: StorefrontLocale = language === "ar" ? "ar" : "en";
  const imageUrl = getFeaturedProductImage(product.images);
  const storefrontUrl = getProductStorefrontUrlForLocale(product, locale);
  const titleValues = getBilingualTitle(product.translations, product.title);
  const isTrash = mode === "trash";

  async function copyStorefrontUrl(): Promise<void> {
    if (!storefrontUrl) return;
    try {
      await navigator.clipboard.writeText(formatProductStorefrontUrlForCopy(storefrontUrl));
      notify.success(t.productUrlCopied);
    } catch {
      notify.error(t.errorMessage);
    }
  }

  return (
    <div className="group/name flex items-center gap-2.5" data-guidance={dataGuidance}>
      {imageUrl ? (
        <MediaImage
          src={imageUrl}
          alt={formatBilingualLabel(titleValues)}
          className="size-8 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <span className="text-[10px] font-semibold">ID</span>
        </span>
      )}

      <div className="min-w-0 space-y-0.5">
        {isTrash ? (
          <div className="min-w-0 text-start text-xs font-semibold leading-4 text-foreground">
            <BilingualText values={titleValues} titleClassName="text-xs font-semibold" secondaryClassName="text-[11px]" />
          </div>
        ) : (
          <button
            type="button"
            className="min-w-0 text-start text-xs font-semibold leading-4 text-brand transition-colors hover:underline"
            onClick={() => onOpenTitle(product)}
          >
            <BilingualText values={titleValues} titleClassName="text-xs font-semibold" secondaryClassName="text-[11px]" />
          </button>
        )}

        <WpRowActions>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-5">
            <span className="text-muted-foreground">
              {t.idLabel}: {product.id}
            </span>

            {isTrash ? (
              <>
                {canDelete && onRestore ? (
                  <>
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.productRestoreAction}
                      className="text-brand"
                      disabled={isRestoring || isForceDeleting}
                      onClick={() => onRestore(product)}
                    />
                  </>
                ) : null}
                {canDelete && onForceDelete ? (
                  <>
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.productForceDeleteAction}
                      className="text-destructive"
                      disabled={isRestoring || isForceDeleting}
                      onClick={() => onForceDelete(product)}
                    />
                  </>
                ) : null}
              </>
            ) : (
              <>
                {canUpdate ? (
                  <>
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.editAction}
                      className="text-brand"
                      onClick={() => onEdit(product)}
                    />
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.quickEdit}
                      className="text-brand"
                      onClick={() => onQuickEdit(product)}
                    />
                  </>
                ) : null}

                {canDelete ? (
                  <>
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.deleteAction}
                      className="text-destructive"
                      onClick={() => onDelete(product)}
                    />
                  </>
                ) : null}

                {canCreate ? (
                  <>
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.duplicate}
                      className="text-brand"
                      disabled={isDuplicating}
                      onClick={() => onDuplicate(product)}
                    />
                  </>
                ) : null}

                {storefrontUrl ? (
                  <>
                    <WpRowActionSeparator />
                    <WpRowActionButton
                      label={t.copyProductUrlShort}
                      className="text-brand"
                      onClick={() => void copyStorefrontUrl()}
                    />
                    <WpRowActionSeparator />
                    <a
                      href={storefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="font-medium text-brand hover:underline"
                    >
                      {t.viewOnWebsite}
                    </a>
                  </>
                ) : null}
              </>
            )}
          </div>
        </WpRowActions>
      </div>
    </div>
  );
}
