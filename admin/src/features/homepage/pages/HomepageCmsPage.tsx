import { SlidersPage } from "@/features/sliders";
import { PageContainer, PageHeader } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

/**
 * The homepage hub. Parkour Phase 1 manages only the slider here; the Aroma promotion tabs stay
 * dormant in `features/slider-promotions` and `features/static-promotions`.
 */
export function HomepageCmsPage() {
  const t = useTranslation();

  return (
    <PageContainer>
      <PageHeader title={t.navHomepage} description={t.sliderHubDescription} />
      <Tabs value="sliders">
        <TabsList className="mb-4">
          <TabsTrigger value="sliders">{t.sliders}</TabsTrigger>
        </TabsList>
        <TabsContent value="sliders" className="mt-0">
          <SlidersPage embedded />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
