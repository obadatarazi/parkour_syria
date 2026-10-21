import { ArrowLeft, type LucideIcon } from "lucide-react";
import {
  type FormEvent,
  type FormHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router";

import { AppButton } from "@/shared/components";
import { CrudFormShell } from "@/shared/crud/components/CrudFormShell";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";

export type CrudRecordWorkspaceSectionItem<TSectionId extends string = string> = {
  id: TSectionId;
  label: string;
  icon: LucideIcon;
  guidance?: string;
  error?: boolean;
};

type CrudRecordWorkspaceBaseProps<TSectionId extends string> = {
  breadcrumbHref: string;
  breadcrumbLabel: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  dirty?: boolean;
  dirtyLabel?: string;
  onBack: () => void;
  backLabel: string;
  headerActions?: ReactNode;
  sections: CrudRecordWorkspaceSectionItem<TSectionId>[];
  activeSection: TSectionId;
  onSectionChange: (section: TSectionId) => void;
  sectionsAriaLabel: string;
  sectionsGuidance?: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
  workspaceGuidance?: string;
};

type CrudRecordWorkspaceFormProps<TSectionId extends string> = CrudRecordWorkspaceBaseProps<TSectionId> & {
  asForm: true;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Cmd/Ctrl+S triggers this (after preventDefault). Omit to disable shortcut. */
  onPersist?: () => void;
  formProps?: Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children" | "className">;
};

type CrudRecordWorkspaceViewProps<TSectionId extends string> = CrudRecordWorkspaceBaseProps<TSectionId> & {
  asForm?: false;
  onSubmit?: never;
  onPersist?: never;
  formProps?: never;
};

export type CrudRecordWorkspaceProps<TSectionId extends string = string> =
  | CrudRecordWorkspaceFormProps<TSectionId>
  | CrudRecordWorkspaceViewProps<TSectionId>;

function WorkspaceChrome<TSectionId extends string>({
  breadcrumbHref,
  breadcrumbLabel,
  title,
  subtitle,
  meta,
  dirty = false,
  dirtyLabel,
  onBack,
  backLabel,
  headerActions,
  sections,
  activeSection,
  onSectionChange,
  sectionsAriaLabel,
  sectionsGuidance,
  children,
  aside,
  onBreadcrumbClick,
}: CrudRecordWorkspaceBaseProps<TSectionId> & {
  onBreadcrumbClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { direction } = useLocalization();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <AppButton
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0 rounded-xl"
              onClick={onBack}
              aria-label={backLabel}
            >
              <ArrowLeft className={cn("size-4", direction === "rtl" && "rotate-180")} />
            </AppButton>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={breadcrumbHref}
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                  onClick={onBreadcrumbClick}
                >
                  {breadcrumbLabel}
                </Link>
                <span className="text-muted-foreground/60" aria-hidden="true">
                  /
                </span>
                <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {title}
                </h1>
                {meta}
                {dirty && dirtyLabel ? (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    {dirtyLabel}
                  </span>
                ) : null}
              </div>
              {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>
          {headerActions ? (
            <div className="flex flex-wrap items-center gap-2 lg:ms-auto">{headerActions}</div>
          ) : null}
        </div>
      </header>

      <div
        className={cn(
          "mx-auto grid w-full max-w-[90rem] gap-6 px-4 py-5 sm:px-6 xl:items-start",
          aside
            ? "xl:grid-cols-[14rem_minmax(0,1fr)_19rem]"
            : "xl:grid-cols-[14rem_minmax(0,1fr)]",
        )}
      >
        <nav
          className="flex gap-1 overflow-x-auto [scrollbar-width:none] pb-1 xl:sticky xl:top-20 xl:flex-col xl:overflow-visible xl:pb-0"
          data-guidance={sectionsGuidance}
          aria-label={sectionsAriaLabel}
        >
          {sections.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                data-guidance={item.guidance}
                className={cn(
                  "inline-flex shrink-0 items-center justify-start gap-2 rounded-xl px-3 py-2 text-start text-sm font-medium transition xl:w-full",
                  isActive
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {item.error ? (
                  <span className="size-1.5 rounded-full bg-rose-400" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-5">{children}</div>

        {aside ? <div className="xl:sticky xl:top-20">{aside}</div> : null}
      </div>
    </>
  );
}

/**
 * Full-page record chrome for large CRUD (products, coupons, orders):
 * sticky header, section nav, main column, optional aside.
 */
export function CrudRecordWorkspace<TSectionId extends string = string>(
  props: CrudRecordWorkspaceProps<TSectionId>,
) {
  const persistRef = useRef<() => void>(() => undefined);
  const asForm = props.asForm === true;
  const onPersist = asForm ? props.onPersist : undefined;

  if (onPersist) {
    persistRef.current = onPersist;
  }

  useEffect(() => {
    if (!onPersist) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.code !== "KeyS" && event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      event.stopPropagation();
      persistRef.current();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onPersist]);

  const onBreadcrumbClick =
    asForm && props.dirty
      ? (event: MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault();
          props.onBack();
        }
      : undefined;

  if (asForm) {
    const { formProps, onSubmit, className, workspaceGuidance, ...chrome } = props;
    return (
      <CrudFormShell
        onSubmit={onSubmit}
        className={cn("flex flex-col space-y-0", className)}
        data-guidance={workspaceGuidance}
        {...formProps}
      >
        <WorkspaceChrome {...chrome} onBreadcrumbClick={onBreadcrumbClick} />
      </CrudFormShell>
    );
  }

  const { className, workspaceGuidance, ...chrome } = props;
  return (
    <div className={cn("flex min-h-full flex-col", className)} data-guidance={workspaceGuidance}>
      <WorkspaceChrome {...chrome} onBreadcrumbClick={onBreadcrumbClick} />
    </div>
  );
}

type CrudRecordSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  dataGuidance?: string;
  as?: "h2" | "h3";
};

export function CrudRecordSection({
  title,
  description,
  children,
  dataGuidance,
  as = "h3",
}: CrudRecordSectionProps) {
  const Heading = as;
  return (
    <section
      className="space-y-5 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
      data-guidance={dataGuidance}
    >
      <div className="space-y-1.5 text-start">
        <Heading className="text-base font-semibold tracking-tight text-foreground">{title}</Heading>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
