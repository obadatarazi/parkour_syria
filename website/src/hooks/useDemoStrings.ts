import { useI18n } from '@/i18n/useI18n';
import type { DemoStrings } from '@/services/demoStrings';

/** Shared locale tree + formatDate for service mappers / sync hooks. */
export function useDemoStrings() {
  const { tm, formatDate } = useI18n();
  const demo = tm<DemoStrings>('demo');
  return { demo, formatDate };
}
