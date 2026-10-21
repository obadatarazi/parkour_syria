import { BookOpen, CalendarDays, GraduationCap, Lightbulb, MapPinned } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Link } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { canAccessRoute, useAbility } from "@/features/auth";
import {
  fetchParkourDashboardStats,
  type ParkourDashboardAccess,
} from "@/features/dashboard/services/parkour-dashboard.service";
import { formatEventDateTime } from "@/features/events/utils/event-labels";
import { suggestionTypeLabel } from "@/features/suggestions/types/suggestions.types";
import {
  AppButton,
  ContentCard,
  EmptyState,
  ErrorState,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  StatCardSkeleton,
  StatusBadge,
} from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

/** The post-login landing page: the moderation queue first, then what the site holds. */
export function ParkourDashboardPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const ability = useAbility();

  const access = useMemo<ParkourDashboardAccess>(
    () => ({
      suggestions: canAccessRoute(ability, PERMISSIONS.MANAGE_SUGGESTION),
      directory: canAccessRoute(ability, PERMISSIONS.MANAGE_DIRECTORY_ENTRY),
      events: canAccessRoute(ability, PERMISSIONS.MANAGE_EVENT),
      lessons: canAccessRoute(ability, PERMISSIONS.MANAGE_LESSON),
      blog: canAccessRoute(ability, PERMISSIONS.MANAGE_BLOG_POST),
    }),
    [ability],
  );

  const queryFn = useCallback(
    (signal?: AbortSignal) => fetchParkourDashboardStats(access, signal),
    [access],
  );
  const stats = useCrudQuery({
    queryKey: ["parkour-dashboard", JSON.stringify(access)],
    queryFn,
    staleTime: 60 * 1000,
  });

  const cards = [
    {
      id: "pending",
      show: access.suggestions,
      label: t.statPendingSuggestions,
      value: stats.data?.pendingSuggestions,
      icon: Lightbulb,
      tone: (stats.data?.pendingSuggestions ?? 0) > 0 ? ("warning" as const) : ("brand" as const),
    },
    {
      id: "directory",
      show: access.directory,
      label: t.statDirectoryEntries,
      value: stats.data?.directoryEntries,
      icon: MapPinned,
      tone: "brand" as const,
    },
    {
      id: "events",
      show: access.events,
      label: t.statUpcomingEvents,
      value: stats.data?.upcomingEvents,
      icon: CalendarDays,
      tone: "success" as const,
    },
    {
      id: "lessons",
      show: access.lessons,
      label: t.statLessons,
      value: stats.data?.lessons,
      icon: GraduationCap,
      tone: "brand" as const,
    },
    {
      id: "blog",
      show: access.blog,
      label: t.statBlogPosts,
      value: stats.data?.blogPosts,
      icon: BookOpen,
      tone: "brand" as const,
    },
  ].filter((card) => card.show);

  const latest = stats.data?.latestPendingSuggestions ?? [];

  return (
    <PageContainer>
      <PageHeader title={t.parkourDashboardTitle} description={t.parkourDashboardDescription} />

      {stats.isError ? (
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(stats.error, t)}
          action={
            <AppButton type="button" variant="outline" onClick={() => void stats.refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      ) : (
        <div className="space-y-6">
          {!stats.data ? (
            <StatCardSkeleton count={cards.length} />
          ) : (
            <StatCardGrid>
              {cards.map((card) => (
                <StatCard
                  key={card.id}
                  label={card.label}
                  value={String(card.value ?? 0)}
                  icon={card.icon}
                  iconTone={card.tone}
                />
              ))}
            </StatCardGrid>
          )}

          {access.suggestions ? (
            <ContentCard
              title={t.latestSuggestions}
              actions={
                <AppButton asChild variant="outline" size="sm">
                  <Link to={ROUTES.admin.suggestions}>{t.reviewSuggestions}</Link>
                </AppButton>
              }
            >
              {latest.length === 0 && !stats.isLoading ? (
                <EmptyState title={t.latestSuggestionsEmpty} />
              ) : (
                <ul className="divide-y divide-border">
                  {latest.map((suggestion) => (
                    <li key={suggestion.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {suggestion.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[
                            suggestion.area?.name,
                            suggestion.createdAt
                              ? formatEventDateTime(suggestion.createdAt, language)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <StatusBadge label={suggestionTypeLabel(t, suggestion.type)} variant="info" />
                    </li>
                  ))}
                </ul>
              )}
            </ContentCard>
          ) : null}
        </div>
      )}
    </PageContainer>
  );
}
