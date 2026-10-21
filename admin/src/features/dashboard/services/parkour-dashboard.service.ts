import { blogPostsService } from "@/features/blog-posts/services/blog-posts.service";
import { directoryEntriesService } from "@/features/directory-entries/services/directory-entries.service";
import { eventsService } from "@/features/events/services/events.service";
import { lessonsService } from "@/features/lessons/services/lessons.service";
import { suggestionsService } from "@/features/suggestions/services/suggestions.service";
import type { Suggestion } from "@/features/suggestions/types/suggestions.types";

export type ParkourDashboardAccess = {
  suggestions: boolean;
  directory: boolean;
  events: boolean;
  lessons: boolean;
  blog: boolean;
};

export type ParkourDashboardStats = {
  pendingSuggestions: number | null;
  directoryEntries: number | null;
  upcomingEvents: number | null;
  lessons: number | null;
  blogPosts: number | null;
  latestPendingSuggestions: Suggestion[];
};

const LATEST_LIMIT = 5;

/**
 * There is no stats endpoint: each figure is the `totalItems` of a one-row list request. A section
 * the user cannot open is not requested at all (it would 403) and comes back as null.
 */
export async function fetchParkourDashboardStats(
  access: ParkourDashboardAccess,
  signal?: AbortSignal,
): Promise<ParkourDashboardStats> {
  const total = async (enabled: boolean, load: () => Promise<{ total: number }>) =>
    enabled ? (await load()).total : null;

  const [pending, directoryEntries, upcomingEvents, lessons, blogPosts] = await Promise.all([
    access.suggestions
      ? suggestionsService.list(
          { status: "pending", limit: LATEST_LIMIT, sort: "created_at", direction: "desc" },
          signal,
        )
      : null,
    total(access.directory, () => directoryEntriesService.list({ limit: 1 }, signal)),
    total(access.events, () => eventsService.list({ limit: 1, upcoming: true }, signal)),
    total(access.lessons, () => lessonsService.list({ limit: 1 }, signal)),
    total(access.blog, () => blogPostsService.list({ limit: 1 }, signal)),
  ]);

  return {
    pendingSuggestions: pending ? pending.total : null,
    directoryEntries,
    upcomingEvents,
    lessons,
    blogPosts,
    latestPendingSuggestions: pending?.data ?? [],
  };
}
