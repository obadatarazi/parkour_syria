import { Search } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { adminNavigationSections, type NavItem } from "@/app/config/navigation";
import { canAccessNavItem, useAbility } from "@/features/auth";
import { Button } from "@/shared/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/design-system/components/ui/dialog";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { Translation } from "@/shared/design-system/localization/locales/en";

type SearchableNavItem = {
  id: string;
  href: string;
  label: string;
  sectionLabel: string;
  icon: NavItem["icon"];
};

type AdminCommandSearchProps = {
  /** Header actions rendered after the mobile search icon (same right cluster). */
  actions?: ReactNode;
};

export function AdminCommandSearch({ actions }: AdminCommandSearchProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const isRTL = direction === "rtl";
  const ability = useAbility();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const next: SearchableNavItem[] = [];

    for (const section of adminNavigationSections) {
      const sectionLabel = t[section.labelKey];
      for (const item of section.items) {
        if (!canAccessNavItem(ability, item)) continue;
        next.push({
          id: item.id,
          href: item.href,
          label: t[item.labelKey as keyof Translation],
          sectionLabel,
          icon: item.icon,
        });
      }
    }

    return next;
  }, [ability, t]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return items;

    return items.filter(
      (item) =>
        item.label.toLocaleLowerCase().includes(normalized) ||
        item.sectionLabel.toLocaleLowerCase().includes(normalized),
    );
  }, [items, query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const item = filtered[activeIndex];
        if (!item) return;
        setOpen(false);
        navigate(item.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filtered, navigate, open]);

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function goTo(href: string) {
    setOpen(false);
    navigate(href);
  }

  const shortcutLabel = isRTL ? "Ctrl K" : "⌘K";

  return (
    <>
      <div className="ms-4 hidden w-52 shrink-0 md:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative w-full rounded-lg bg-muted text-start transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          aria-label={t.adminSearchPlaceholder}
        >
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <span className="flex h-8 w-full items-center truncate ps-8 pe-12 text-xs text-muted-foreground">
            {t.adminSearchPlaceholder}
          </span>
          <kbd className="pointer-events-none absolute end-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-border/70 bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            {shortcutLabel}
          </kbd>
        </button>
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl md:hidden"
          onClick={() => setOpen(true)}
          aria-label={t.adminSearchPlaceholder}
        >
          <Search className="size-5" />
        </Button>
        {actions}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideCloseButton
          className="gap-0 overflow-hidden p-0 sm:max-w-lg"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{t.adminSearchTitle}</DialogTitle>
          <DialogDescription className="sr-only">{t.adminSearchDescription}</DialogDescription>

          <div className="relative border-b border-border/60">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.adminSearchPlaceholder}
              className="h-10 rounded-none border-0 bg-transparent ps-11 pe-4 text-sm shadow-none focus-visible:ring-0"
              aria-label={t.adminSearchPlaceholder}
              autoComplete="off"
            />
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto p-2" role="listbox">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t.adminSearchNoResults}
              </p>
            ) : (
              filtered.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-index={index}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition",
                      isActive ? "bg-brand text-brand-foreground" : "hover:bg-muted",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goTo(item.href)}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-current" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                    <span
                      className={cn(
                        "shrink-0 text-xs",
                        isActive ? "text-brand-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {item.sectionLabel}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
