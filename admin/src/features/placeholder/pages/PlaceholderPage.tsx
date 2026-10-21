import { EmptyState, PageContainer, PageHeader } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function PlaceholderPage() {
  const t = useTranslation();

  return (
    <PageContainer>
      <PageHeader title={t.comingSoon} description={t.placeholderPageDescription} />
      <EmptyState title={t.comingSoon} description={t.placeholderPageDescription} />
    </PageContainer>
  );
}
