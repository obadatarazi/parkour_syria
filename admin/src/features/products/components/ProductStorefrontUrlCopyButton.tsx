import { Copy, ExternalLink } from "lucide-react";

import type { Product } from "@/features/products/types/products.types";
import {
  getProductStorefrontUrlForLocale,
  getProductStorefrontUrlFromTranslations,
  formatProductStorefrontUrlForCopy,
  type StorefrontLocale,
} from "@/features/products/utils/product-storefront-url.utils";
import { AppButton } from "@/shared/components";
import { useLocalization, useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { ProductTranslationsInput } from "@/shared/lib/api/form-data.utils";
import { notify } from "@/shared/lib/notifications";

type ProductStorefrontUrlSource = {
  product?: Pick<Product, "translations" | "slug"> | null;
  translations?: ProductTranslationsInput;
};

function resolveStorefrontUrl(
  source: ProductStorefrontUrlSource,
  locale: StorefrontLocale,
): string | null {
  if (source.translations) {
    return getProductStorefrontUrlFromTranslations(source.translations, locale);
  }
  if (source.product) {
    return getProductStorefrontUrlForLocale(source.product, locale);
  }
  return null;
}

async function copyText(value: string, successMessage: string, errorMessage: string): Promise<void> {
  const readableUrl = formatProductStorefrontUrlForCopy(value);
  try {
    await navigator.clipboard.writeText(readableUrl);
    notify.success(successMessage);
  } catch {
    notify.error(errorMessage);
  }
}

type ProductStorefrontUrlCopyButtonProps = ProductStorefrontUrlSource & {
  showViewLink?: boolean;
  size?: "default" | "sm";
};

export function ProductStorefrontUrlCopyButton({
  product,
  translations,
  showViewLink = true,
  size = "default",
}: ProductStorefrontUrlCopyButtonProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const locale: StorefrontLocale = language === "ar" ? "ar" : "en";
  const url = resolveStorefrontUrl({ product, translations }, locale);

  if (!url) return null;

  return (
    <>
      <AppButton
        type="button"
        variant="outline"
        size={size}
        onClick={() => void copyText(url, t.productUrlCopied, t.errorMessage)}
      >
        <Copy className="size-4" aria-hidden="true" />
        {t.copyProductUrl}
      </AppButton>
      {showViewLink ? (
        <AppButton type="button" variant="outline" size={size} asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" aria-hidden="true" />
            {t.viewOnWebsite}
          </a>
        </AppButton>
      ) : null}
    </>
  );
}

type ProductStorefrontUrlDisplayProps = ProductStorefrontUrlSource;

function StorefrontUrlRow({
  label,
  url,
  onCopy,
  copyLabel,
}: {
  label: string;
  url: string;
  onCopy: () => void;
  copyLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-start gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="min-w-0 flex-1 break-all rounded-md bg-muted/30 px-2 py-1.5 font-mono text-xs text-brand hover:underline"
        >
          {url}
        </a>
        <AppButton type="button" variant="outline" size="sm" onClick={onCopy}>
          <Copy className="size-3.5" aria-hidden="true" />
          {copyLabel}
        </AppButton>
      </div>
    </div>
  );
}

export function ProductStorefrontUrlDisplay({ product, translations }: ProductStorefrontUrlDisplayProps) {
  const t = useTranslation();
  const enUrl = resolveStorefrontUrl({ product, translations }, "en");
  const arUrl = resolveStorefrontUrl({ product, translations }, "ar");

  if (!enUrl && !arUrl) {
    return <span className="text-muted-foreground">{t.notSet}</span>;
  }

  return (
    <div className="space-y-3">
      {enUrl ? (
        <StorefrontUrlRow
          label={`${t.productStorefrontUrl} (${t.tabEnglish})`}
          url={enUrl}
          copyLabel={t.copyProductUrlShort}
          onCopy={() => void copyText(enUrl, t.productUrlCopied, t.errorMessage)}
        />
      ) : null}
      {arUrl ? (
        <StorefrontUrlRow
          label={`${t.productStorefrontUrl} (${t.tabArabic})`}
          url={arUrl}
          copyLabel={t.copyProductUrlShort}
          onCopy={() => void copyText(arUrl, t.productUrlCopied, t.errorMessage)}
        />
      ) : null}
    </div>
  );
}
