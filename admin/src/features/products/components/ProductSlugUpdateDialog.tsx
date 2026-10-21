import type { ProductSlugUpdatePrompt } from "@/features/products/utils/product-slug.utils";
import { TextField } from "@/shared/components";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/shared/design-system/components/ui/alert-dialog";
import { Button } from "@/shared/design-system/components/ui/button";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductSlugUpdateDialogProps = {
  open: boolean;
  prompt: ProductSlugUpdatePrompt | null;
  draftSlug: string;
  onDraftSlugChange: (value: string) => void;
  onKeepCurrentSlug: () => void;
  onUpdateSlug: () => void;
};

export function ProductSlugUpdateDialog({
  open,
  prompt,
  draftSlug,
  onDraftSlugChange,
  onKeepCurrentSlug,
  onUpdateSlug,
}: ProductSlugUpdateDialogProps) {
  const t = useTranslation();

  if (!prompt) {
    return null;
  }

  const localeLabel = prompt.locale === "en" ? t.tabEnglish : t.tabArabic;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onKeepCurrentSlug();
        }
      }}
    >
      <AlertDialogContent className="gap-0 sm:max-w-lg">
        <AlertDialogTitle className="mb-1">
          {t.productSlugUpdateTitle.replace("{locale}", localeLabel)}
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="mb-4 space-y-4 text-sm text-muted-foreground">
            <p>{t.productSlugUpdateDescription}</p>
            <TextField
              label={t.slug}
              value={draftSlug}
              onChange={(event) => onDraftSlugChange(event.target.value)}
              helperText={t.slugSuggestedFromTitle}
              dir={prompt.locale === "ar" ? "rtl" : undefined}
              autoFocus
            />
          </div>
        </AlertDialogDescription>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onKeepCurrentSlug}>
            {t.productSlugUpdateKeep}
          </Button>
          <Button type="button" className="flex-1" onClick={onUpdateSlug} disabled={!draftSlug.trim()}>
            {t.productSlugUpdateConfirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
