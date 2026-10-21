import { BellRing, Mail, Users } from "lucide-react";

import type { NotificationRoute } from "@/features/notification-routes/types/notification-routes.types";
import { StatCard, StatCardGrid, StatCardSkeleton } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationRouteStatsProps = {
  items: NotificationRoute[];
  isLoading?: boolean;
};

export function NotificationRouteStats({ items, isLoading = false }: NotificationRouteStatsProps) {
  const t = useTranslation();

  if (isLoading) {
    return <StatCardSkeleton count={3} className="grid-cols-1 sm:grid-cols-3" />;
  }

  const configured = items.filter((item) => item.recipients.length > 0).length;
  const fallback = items.filter((item) => item.recipients.length === 0).length;
  const withEmail = items.filter((item) =>
    item.recipients.some((recipient) => recipient.email),
  ).length;

  return (
    <StatCardGrid className="grid-cols-1 sm:grid-cols-3">
      <StatCard
        label={t.notificationRouteStatConfigured}
        value={String(configured)}
        icon={Users}
        iconTone="success"
      />
      <StatCard
        label={t.notificationRouteStatFallback}
        value={String(fallback)}
        icon={BellRing}
        iconTone="warning"
      />
      <StatCard
        label={t.notificationRouteStatEmail}
        value={String(withEmail)}
        icon={Mail}
        iconTone="brand"
      />
    </StatCardGrid>
  );
}
