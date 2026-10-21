/**
 * Design system public surface.
 * Future extraction target: packages/design-system
 */
export { LanguageSwitcher } from "@/shared/design-system/components/LanguageSwitcher";
export {
  LocalizationProvider,
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
export type { Translation } from "@/shared/design-system/localization/locales/en";
