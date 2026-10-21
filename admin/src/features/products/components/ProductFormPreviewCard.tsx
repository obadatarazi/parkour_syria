import { ImageIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getBrandLabel, useBrandPicker } from "@/features/products/hooks/use-brand-picker";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import type { ProductCompletenessItem } from "@/features/products/utils/product-form-completeness";
import { scoreSeoOverall } from "@/features/products/utils/seo-score.utils";
import { ImageReplaceHoverOverlay, MediaImage } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { PRODUCT_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";

type ProductFormPreviewCardProps = {
  titleEn: string;
  titleAr: string;
  published: boolean;
  featuredImageUrl: string | null;
  featuredImageFile: File | null;
  metaTitle: string;
  metaDescription: string;
  brandId: number | null;
  brandSeed?: RelationPickerSeed | null;
  price: number;
  skuCode: string;
  stock: number;
  completeness: ProductCompletenessItem[];
  completenessLabels: Record<string, string>;
  onJumpToSection: (section: ProductCompletenessItem["section"]) => void;
  onFeaturedImageFile?: (file: File) => void;
};

export function ProductFormPreviewCard({
  titleEn,
  titleAr,
  published,
  featuredImageUrl,
  featuredImageFile,
  metaTitle,
  metaDescription,
  brandId,
  brandSeed = null,
  price,
  skuCode,
  stock,
  completeness,
  completenessLabels,
  onJumpToSection,
  onFeaturedImageFile,
}: ProductFormPreviewCardProps) {
  const t = useTranslation();
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const { selectedBrand } = useBrandPicker({
    selectedId: brandId,
    seedItem: brandSeed,
    enabled: true,
  });
  const brandLabel = selectedBrand ? getBrandLabel(selectedBrand) : null;
  const doneCount = completeness.filter((item) => item.done).length;
  const totalCount = completeness.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const seo = scoreSeoOverall(metaTitle, metaDescription);
  const previewSrc = filePreviewUrl || featuredImageUrl;
  const displayTitle = titleEn.trim() || titleAr.trim();

  useEffect(() => {
    if (!featuredImageFile) {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(featuredImageFile);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [featuredImageFile]);

  const seoToneClass = useMemo(() => {
    if (seo.tone === "good") return "bg-emerald-500";
    if (seo.tone === "ok") return "bg-amber-500";
    return "bg-rose-400";
  }, [seo.tone]);

  return (
    <aside
      className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
      data-guidance={PRODUCT_FORM_ANCHORS.preview}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.productPreview}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            published
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          {published ? t.publish : t.draft}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {onFeaturedImageFile ? (
          <input
            ref={featuredInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFeaturedImageFile(file);
              event.target.value = "";
            }}
          />
        ) : null}
        {previewSrc ? (
          onFeaturedImageFile ? (
            <button
              type="button"
              className="group relative block w-full"
              onClick={() => {
                if (!featuredInputRef.current) return;
                featuredInputRef.current.value = "";
                featuredInputRef.current.click();
              }}
              aria-label={t.clickToChangeImage}
            >
              <MediaImage
                src={previewSrc}
                alt=""
                className="aspect-[3/4] max-h-72 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
              />
              <ImageReplaceHoverOverlay label={t.clickToChangeImage} />
            </button>
          ) : (
            <MediaImage src={previewSrc} alt="" className="aspect-[3/4] max-h-72 w-full object-cover" />
          )
        ) : (
          <button
            type="button"
            disabled={!onFeaturedImageFile}
            className="flex aspect-[3/4] max-h-56 w-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground disabled:cursor-default"
            onClick={() => featuredInputRef.current?.click()}
          >
            <ImageIcon className="size-8 opacity-50" aria-hidden="true" />
            <p className="text-xs">{onFeaturedImageFile ? t.clickToChangeImage : t.productTabMedia}</p>
          </button>
        )}
        <div className="space-y-1 p-3">
          {brandLabel ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {brandLabel}
            </p>
          ) : null}
          <p className={cn("text-sm font-semibold leading-snug", displayTitle ? "text-foreground" : "text-muted-foreground")}>
            {displayTitle || t.notSet}
          </p>
          {titleEn.trim() && titleAr.trim() ? (
            <p className="text-xs leading-snug text-muted-foreground" dir="rtl">
              {titleAr}
            </p>
          ) : null}
          <p className="pt-1 text-sm font-bold tabular-nums text-brand">{formatKwd(price)}</p>
          <p className="text-[11px] text-muted-foreground">
            {skuCode.trim() ? `${t.sku}: ${skuCode.trim()}` : `${t.sku}: ${t.notSet}`}
            {" · "}
            {t.stock}: {stock}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{t.productCompleteness}</span>
          <span className="tabular-nums text-muted-foreground">
            {doneCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress === 100 ? "bg-emerald-500" : "bg-brand",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-1.5 pt-1">
          {completeness.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onJumpToSection(item.section)}
                className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-start text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    item.done ? "bg-emerald-500" : "bg-border",
                  )}
                  aria-hidden="true"
                />
                <span className={item.done ? "text-foreground" : undefined}>
                  {completenessLabels[item.id] ?? item.id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">{t.productSeoScoreLabel}</p>
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full text-xs font-bold text-white tabular-nums",
            seoToneClass,
          )}
        >
          {seo.score}
        </span>
      </div>
    </aside>
  );
}
