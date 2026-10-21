import { Filter } from "lucide-react";
import { type ReactNode,useMemo, useState } from "react";

import { AppButton } from "@/shared/components";
import { CrudFilterSelect } from "@/shared/crud/components/CrudFilterSelect";
import { CrudSearchField } from "@/shared/crud/components/CrudSearchField";
import { CrudSortBar } from "@/shared/crud/components/CrudSortBar";
import type { CrudFilterDefinition, CrudSortDefinition } from "@/shared/crud/types/crud.types";
import {
  countActiveFiltersForIds,
  splitFilterDefinitions,
} from "@/shared/crud/utils/filter.utils";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export type CrudTableControlsSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  dataGuidance?: string;
};

export type CrudTableControlsFiltersProps = {
  definitions: CrudFilterDefinition[];
  values: Record<string, string>;
  onChange: (filterId: string, value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  dataGuidance?: string;
  /** Optional node rendered at the end of the filters cluster (e.g. guidance hotspot). */
  endAdornment?: ReactNode;
};

export type CrudTableControlsSortProps = {
  definitions: CrudSortDefinition[];
  value: string;
  onChange: (value: string) => void;
};

export type CrudTableControlsProps = {
  search?: CrudTableControlsSearchProps;
  filters?: CrudTableControlsFiltersProps;
  sort?: CrudTableControlsSortProps;
  toolbarActions?: ReactNode;
  trailingActions?: ReactNode;
  className?: string;
};

export function CrudTableControls({
  search,
  filters,
  sort,
  toolbarActions,
  trailingActions,
  className,
}: CrudTableControlsProps) {
  const t = useTranslation();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const { primary, secondary } = useMemo(
    () => splitFilterDefinitions(filters?.definitions ?? []),
    [filters?.definitions],
  );

  const secondaryActiveCount = useMemo(() => {
    if (!filters) return 0;
    return countActiveFiltersForIds(
      secondary.map((filter) => filter.id),
      filters.values,
    );
  }, [filters, secondary]);

  const hasMoreFilters = secondary.length > 0 || (sort?.definitions.length ?? 0) > 0;
  const moreFiltersBadgeCount = secondaryActiveCount;

  return (
    <div className={cn("border-b border-border/60 bg-card", className)}>
      <div className="flex flex-wrap items-center gap-2 px-5 py-4">
        {search ? (
          <div data-guidance={search.dataGuidance} className="inline-flex shrink-0">
            <CrudSearchField
              value={search.value}
              onChange={search.onChange}
              onReset={search.onReset}
              placeholder={search.placeholder ?? t.adminSearchPlaceholder}
              ariaLabel={search.ariaLabel ?? t.search}
              className="w-52 shrink-0"
              inputClassName="h-8 rounded-xl border-0 bg-muted text-xs focus-visible:ring-brand/30"
            />
          </div>
        ) : null}

        {filters || hasMoreFilters ? (
          <div
            data-guidance={filters?.dataGuidance}
            className="flex flex-wrap items-center gap-2"
          >
            {filters
              ? primary.map((filter) => (
                  <CrudFilterSelect
                    key={filter.id}
                    filter={filter}
                    value={filters.values[filter.id] ?? ""}
                    onChange={(value) => filters.onChange(filter.id, value)}
                    compact
                  />
                ))
              : null}

            {hasMoreFilters ? (
              <AppButton
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={() => setMoreFiltersOpen((open) => !open)}
                aria-expanded={moreFiltersOpen}
                aria-controls="crud-more-filters-panel"
              >
                <Filter className="size-3.5" aria-hidden="true" />
                {t.filter}
                {moreFiltersBadgeCount > 0 ? (
                  <span className="ms-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                    {moreFiltersBadgeCount}
                  </span>
                ) : null}
              </AppButton>
            ) : null}
            {filters?.endAdornment}
          </div>
        ) : null}

        {toolbarActions || trailingActions ? (
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {toolbarActions}
            {trailingActions}
          </div>
        ) : null}
      </div>

      {moreFiltersOpen && hasMoreFilters ? (
        <div
          id="crud-more-filters-panel"
          className="border-t border-border/60 bg-muted/20 px-5 py-3"
        >
          <div className="flex flex-wrap items-center gap-3">
            {filters
              ? secondary.map((filter) => (
                  <CrudFilterSelect
                    key={filter.id}
                    filter={filter}
                    value={filters.values[filter.id] ?? ""}
                    onChange={(value) => filters.onChange(filter.id, value)}
                  />
                ))
              : null}
            {sort ? (
              <CrudSortBar
                sorts={sort.definitions}
                value={sort.value}
                onChange={sort.onChange}
              />
            ) : null}
            {filters?.hasActiveFilters ? (
              <AppButton variant="ghost" size="sm" onClick={filters.onReset}>
                {t.clearFilters}
              </AppButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
