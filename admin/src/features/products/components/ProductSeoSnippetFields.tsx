import { ImageIcon, Pencil, Search } from "lucide-react";
import { useState } from "react";

import { buildProductStorefrontUrl } from "@/features/products/utils/product-storefront-url.utils";
import {
  scoreSeoDescription,
  scoreSeoOverall,
  scoreSeoTitle,
  type SeoScoreTone,
} from "@/features/products/utils/seo-score.utils";
import { AppButton, MediaImage, TextAreaField, TextField } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { slugifyArabicTitle, slugifyEnglishTitle } from "@/shared/lib/slug.utils";

const META_TITLE_SOFT_LIMIT = 60;
const META_DESCRIPTION_SOFT_LIMIT = 160;

type ProductSeoSnippetFieldsProps = {
  locale: "en" | "ar";
  title: string;
  description: string;
  slug?: string;
  metaTitle: string;
  metaDescription: string;
  /** SEO / social image shown in the search preview thumbnail. */
  previewImageUrl?: string | null;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  /** When true, meta fields stay open (used on the dedicated SEO tab). */
  alwaysEditing?: boolean;
};

function resolveSlug(locale: "en" | "ar", title: string, slug?: string): string {
  const saved = slug?.trim();
  if (saved) return saved;
  if (!title.trim()) return "product-slug";
  return locale === "en" ? slugifyEnglishTitle(title) : slugifyArabicTitle(title);
}

function truncatePreview(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function toneClass(tone: SeoScoreTone): string {
  if (tone === "good") return "bg-emerald-500 text-white";
  if (tone === "ok") return "bg-amber-500 text-white";
  return "bg-rose-500 text-white";
}

function toneLabel(
  tone: SeoScoreTone,
  t: ReturnType<typeof useTranslation>,
): string {
  if (tone === "good") return t.seoScoreGood;
  if (tone === "ok") return t.seoScoreOk;
  return t.seoScorePoor;
}

function SeoRankBadge({
  score,
  tone,
  label,
}: {
  score: number;
  tone: SeoScoreTone;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full text-xs font-bold tabular-nums",
          toneClass(tone),
        )}
        title={`${label}: ${score}/10`}
      >
        {score}
      </span>
      <span className="text-xs text-muted-foreground">
        {label} · {score}/10
      </span>
    </div>
  );
}

function CharCounter({ value, limit }: { value: string; limit: number }) {
  const length = value.trim().length;
  const over = length > limit;

  return (
    <span
      className={cn(
        "text-[11px] tabular-nums",
        over ? "font-medium text-amber-600" : "text-muted-foreground",
      )}
    >
      {length}/{limit}
    </span>
  );
}

export function ProductSeoSnippetFields({
  locale,
  title,
  description,
  slug,
  metaTitle,
  metaDescription,
  previewImageUrl,
  onMetaTitleChange,
  onMetaDescriptionChange,
  alwaysEditing = false,
}: ProductSeoSnippetFieldsProps) {
  const t = useTranslation();
  const [isEditing, setIsEditing] = useState(alwaysEditing);
  const showEditor = alwaysEditing || isEditing;

  const effectiveTitle = metaTitle.trim() || title.trim();
  const effectiveDescription = metaDescription.trim() || description.trim();

  const titleScore = scoreSeoTitle(metaTitle);
  const descriptionScore = scoreSeoDescription(metaDescription);
  const overallScore = scoreSeoOverall(metaTitle, metaDescription);

  const previewTitle = (effectiveTitle || t.seoSnippetUntitled).trim();
  const previewDescription = (effectiveDescription || t.seoSnippetNoDescription).trim();
  const previewSlug = resolveSlug(locale, title, slug);
  const previewUrl = buildProductStorefrontUrl(locale, previewSlug) ?? "";
  const hasPreviewImage = Boolean(previewImageUrl?.trim());

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">{t.seoSnippetPreview}</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full text-xs font-bold tabular-nums",
              toneClass(overallScore.tone),
            )}
            aria-label={`${t.seoScoreOverall}: ${overallScore.score}/10`}
          >
            {overallScore.score}
          </span>
          <span className="text-xs text-muted-foreground">
            {t.seoScoreOverall}: {toneLabel(overallScore.tone, t)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div
          className="rounded-lg border border-border/70 bg-background px-4 py-3"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-mono text-xs text-muted-foreground"
                dir="ltr"
                title={previewUrl}
              >
                {previewUrl}
              </p>
              <p className="mt-1 text-base font-medium leading-snug text-[#1a0dab] dark:text-sky-400">
                {truncatePreview(previewTitle, META_TITLE_SOFT_LIMIT + 10)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#4d5156] dark:text-muted-foreground">
                {truncatePreview(previewDescription, META_DESCRIPTION_SOFT_LIMIT + 20)}
              </p>
            </div>

            <div
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/40 sm:size-20",
                !hasPreviewImage && "flex items-center justify-center",
              )}
              aria-label={t.metaFeatureImage}
            >
              {hasPreviewImage ? (
                <MediaImage
                  src={previewImageUrl!}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground/70" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {!showEditor ? (
          <AppButton
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {t.seoEditSnippet}
          </AppButton>
        ) : (
          <div className="space-y-4 rounded-lg border border-border/70 bg-muted/15 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{t.seoEditSnippet}</p>
              {!alwaysEditing ? (
                <AppButton type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  {t.seoDoneEditing}
                </AppButton>
              ) : null}
            </div>

            <TextField
              label={t.metaTitle}
              value={metaTitle}
              onChange={(event) => onMetaTitleChange(event.target.value)}
              helperText={t.metaTitleHint}
              dir={locale === "ar" ? "rtl" : undefined}
              autoFocus={!alwaysEditing}
            />
            <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
              <SeoRankBadge
                score={titleScore.score}
                tone={titleScore.tone}
                label={t.seoScoreTitle}
              />
              <CharCounter value={metaTitle} limit={META_TITLE_SOFT_LIMIT} />
            </div>
            <p className="text-[11px] text-muted-foreground">{t.seoScoreTitleHint}</p>

            <TextAreaField
              label={t.metaDescription}
              value={metaDescription}
              onChange={(event) => onMetaDescriptionChange(event.target.value)}
              helperText={t.metaDescriptionHint}
              dir={locale === "ar" ? "rtl" : undefined}
              rows={4}
            />
            <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
              <SeoRankBadge
                score={descriptionScore.score}
                tone={descriptionScore.tone}
                label={t.seoScoreDescription}
              />
              <CharCounter value={metaDescription} limit={META_DESCRIPTION_SOFT_LIMIT} />
            </div>
            <p className="text-[11px] text-muted-foreground">{t.seoScoreDescriptionHint}</p>
          </div>
        )}
      </div>
    </section>
  );
}
