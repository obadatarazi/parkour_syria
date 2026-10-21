import { createStandardAnchors,CRUD_FORM_DRAWER_ANCHORS, CRUD_FORM_FIELD_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import type {
  GuidancePageId,
  PageGuidanceConfig,
  TourStepDef,
} from "@/shared/guidance/types/guidance.types";

export type CrudGuidanceCopy = {
  /** Page title shown in step 1, e.g. "Brands" */
  pageTitle: string;
  /** Short entity name for sentences, e.g. "brands" */
  entityPlural: string;
  searchTitle?: string;
  searchDescription?: string;
  filtersTitle?: string;
  filtersDescription?: string;
  addTitle?: string;
  addDescription?: string;
  actionsTitle?: string;
  actionsDescription?: string;
  workspaceDescription?: string;
};

export type CreateCrudGuidanceOptions = {
  pageId: GuidancePageId;
  routePath: string;
  copy: CrudGuidanceCopy;
  /** Extra product-tour steps inserted before row-actions */
  extraProductSteps?: TourStepDef[];
  /** Extra product-tour steps inserted after the title (e.g. page widgets). */
  prependProductSteps?: TourStepDef[];
  checklist?: PageGuidanceConfig["checklist"];
  contextualTip?: PageGuidanceConfig["contextualTip"];
  featureDiscovery?: PageGuidanceConfig["featureDiscovery"];
  hotspots?: PageGuidanceConfig["hotspots"];
  coachMarks?: TourStepDef[];
  walkthrough?: TourStepDef[];
  formTour?: TourStepDef[];
  autoProductTourOnce?: boolean;
  autoFormTourOnce?: boolean;
  includeStatusStep?: boolean;
  statusStep?: TourStepDef;
  /** Defaults true — set false to omit standard patterns */
  includeCoachMarks?: boolean;
  includeWalkthrough?: boolean;
  includeFormTour?: boolean;
  includeChecklist?: boolean;
  includeFeatureDiscovery?: boolean;
  includeContextualTip?: boolean;
  /** Auto-show tip/banner on first visit (default false — available from Help). */
  autoShowTip?: boolean;
  autoShowFeatureDiscovery?: boolean;
};

/** Wait only for the first drawer step after Create is clicked (walkthrough). */
const DRAWER_WAIT_MS = 4000;

function defaultCoachMarks(anchors: ReturnType<typeof createStandardAnchors>): TourStepDef[] {
  return [
    {
      id: "coach-add",
      anchor: anchors.add,
      title: "Create",
      description: "Use this button when you need to add a new record.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "coach-search",
      anchor: anchors.search,
      title: "Search",
      description: "Type here anytime you need to locate a specific record.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ];
}

export type DefaultFormTourOptions = {
  /** When true, the first step waits for the drawer (walkthrough after Create click). */
  waitForDrawer?: boolean;
};

/**
 * Shared create-drawer tour used by walkthrough + auto form tour.
 * Form tour runs after the drawer is already open — do not wait on every step
 * (long waits freeze the previous popover and feel like a stuck tour).
 */
export function defaultFormTour(options?: DefaultFormTourOptions): TourStepDef[] {
  const waitMs = options?.waitForDrawer ? DRAWER_WAIT_MS : undefined;

  return [
    {
      id: "form-drawer",
      anchor: CRUD_FORM_DRAWER_ANCHORS.panel,
      title: "Create form",
      description: "This side panel is where you create or edit a record.",
      side: "left",
      align: "start",
      ...(waitMs != null ? { waitForElement: waitMs } : {}),
      skipIfMissing: true,
    },
    {
      id: "form-title",
      anchor: CRUD_FORM_DRAWER_ANCHORS.title,
      title: "Form title",
      description: "The header shows whether you are creating or editing.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "form-body",
      anchor: CRUD_FORM_DRAWER_ANCHORS.body,
      title: "Fill in the fields",
      description: "Complete the required fields here. Scroll if the form is long.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "form-visibility",
      anchor: CRUD_FORM_FIELD_ANCHORS.visibility,
      title: "Visibility",
      description:
        "Use these toggles to publish the record and control how it appears on the storefront.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "form-actions",
      anchor: CRUD_FORM_FIELD_ANCHORS.actions,
      title: "Save or cancel",
      description: "Click Save when you are done, or Cancel to close without saving.",
      side: "top",
      align: "end",
      skipIfMissing: true,
    },
  ];
}

function defaultWalkthrough(anchors: ReturnType<typeof createStandardAnchors>): TourStepDef[] {
  return [
    {
      id: "walk-intro",
      title: "Create walkthrough",
      description: "We'll guide you through creating a new record. Click Next to begin.",
    },
    {
      id: "walk-add",
      anchor: anchors.add,
      title: "Click Create",
      description: "Click the highlighted button to open the create form.",
      side: "bottom",
      align: "end",
      advanceOnClick: true,
      skipIfMissing: true,
    },
    ...defaultFormTour({ waitForDrawer: true }),
    {
      id: "walk-done",
      title: "Nice work",
      description: "The form is ready. Fill it in and save when you're done.",
    },
  ];
}

function defaultChecklist(entityPlural: string): NonNullable<PageGuidanceConfig["checklist"]> {
  return {
    title: `Get started with ${entityPlural}`,
    description: "Complete these tasks to get comfortable with this page.",
    items: [
      { id: "create-first", label: `Create your first record` },
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Try filters or sorting" },
    ],
  };
}

export function createCrudGuidance(options: CreateCrudGuidanceOptions): PageGuidanceConfig {
  const anchors = createStandardAnchors(options.pageId);
  const c = options.copy;
  const includeCoachMarks = options.includeCoachMarks ?? true;
  const includeWalkthrough = options.includeWalkthrough ?? true;
  const includeFormTour = options.includeFormTour ?? true;
  const includeChecklist = options.includeChecklist ?? true;
  const includeFeatureDiscovery = options.includeFeatureDiscovery ?? false;
  const includeContextualTip = options.includeContextualTip ?? true;
  const formTour = options.formTour ?? (includeFormTour ? defaultFormTour() : undefined);

  const productTour: TourStepDef[] = [
    {
      id: "title",
      anchor: anchors.title,
      title: c.pageTitle,
      description:
        c.workspaceDescription ??
        `Manage ${c.entityPlural} from this page — search, filter, create, and edit.`,
      side: "bottom",
      align: "start",
    },
    ...(options.prependProductSteps ?? []),
    {
      id: "search",
      anchor: anchors.search,
      title: c.searchTitle ?? "Search",
      description:
        c.searchDescription ?? `Find ${c.entityPlural} quickly by typing in the search field.`,
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "filters",
      anchor: anchors.filters,
      title: c.filtersTitle ?? "Filters",
      description: c.filtersDescription ?? `Narrow the list with filters and sorting options.`,
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "add",
      anchor: anchors.add,
      title: c.addTitle ?? "Create",
      description: c.addDescription ?? `Add a new record when you need to create one.`,
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    ...(options.extraProductSteps ?? []),
    ...(options.includeStatusStep && options.statusStep
      ? [options.statusStep]
      : options.includeStatusStep
        ? [
            {
              id: "status",
              anchor: anchors.status,
              title: "Quick status",
              description: "Click the status control to update without opening the full form.",
              side: "bottom" as const,
              align: "start" as const,
              skipIfMissing: true,
            },
          ]
        : []),
    {
      id: "row-actions",
      anchor: anchors.rowActions,
      title: c.actionsTitle ?? "Row actions",
      description:
        c.actionsDescription ?? "View, edit, or delete individual rows from the actions menu.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
  ];

  return {
    pageId: options.pageId,
    routePath: options.routePath,
    anchors: {
      title: anchors.title,
      search: anchors.search,
      filters: anchors.filters,
      add: anchors.add,
      rowActions: anchors.rowActions,
      status: anchors.status,
    },
    productTour,
    coachMarks: options.coachMarks ?? (includeCoachMarks ? defaultCoachMarks(anchors) : undefined),
    walkthrough:
      options.walkthrough ?? (includeWalkthrough ? defaultWalkthrough(anchors) : undefined),
    formTour,
    checklist:
      options.checklist ?? (includeChecklist ? defaultChecklist(c.entityPlural) : undefined),
    contextualTip:
      options.contextualTip ??
      (includeContextualTip
        ? {
            title: "Tip for this page",
            description: "Use search and filters to find records faster, or open Help for a page tour.",
          }
        : undefined),
    featureDiscovery:
      options.featureDiscovery ??
      (includeFeatureDiscovery
        ? {
            title: "What's new on this page",
            description: "Use Help anytime for a page tour, coach marks, walkthrough, or checklist.",
          }
        : undefined),
    hotspots: options.hotspots,
    autoProductTourOnce: options.autoProductTourOnce,
    autoFormTourOnce: options.autoFormTourOnce ?? includeFormTour,
    autoShowTip: options.autoShowTip,
    autoShowFeatureDiscovery: options.autoShowFeatureDiscovery,
  };
}
