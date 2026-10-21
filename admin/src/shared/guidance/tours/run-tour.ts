import type { Config, Driver, PopoverDOM } from "driver.js";

import { GUIDANCE_POPOVER_CLASS } from "@/shared/guidance/constants/guidance.constants";
import type { TourStepDef } from "@/shared/guidance/types/guidance.types";
import { buildTourSteps } from "@/shared/guidance/utils/build-tour-steps";

export type RunTourOptions = {
  next: string;
  previous: string;
  done: string;
  progress: string;
  /** Explicit cancel — always visible in the popover footer. */
  skip: string;
  showProgress?: boolean;
  onDestroyed?: () => void;
};

let activeDriver: Driver | null = null;
/** Bumped on destroy/start so in-flight dynamic imports cannot revive a cancelled tour. */
let tourGeneration = 0;
let driverLoadPromise: Promise<typeof import("driver.js")> | null = null;

async function ensureDriverModule() {
  if (!driverLoadPromise) {
    driverLoadPromise = (async () => {
      await Promise.all([
        import("driver.js/dist/driver.css"),
        import("@/shared/guidance/styles/guidance.css"),
      ]);
      return import("driver.js");
    })();
  }
  return driverLoadPromise;
}

function applyDir(wrapper: HTMLElement) {
  const dir = document.documentElement.getAttribute("dir") || "ltr";
  wrapper.setAttribute("dir", dir);
  wrapper.style.direction = dir;
}

/**
 * Radix Dialog/Sheet + RemoveScroll mark body as `block-interactivity-*` and only
 * allow pointer events inside the modal. Driver popovers mount on `document.body`,
 * so without this unlock the Next/Close buttons appear dead while a drawer is open.
 */
function unlockPopoverForModals(wrapper: HTMLElement) {
  wrapper.style.pointerEvents = "auto";
  document.body.classList.forEach((cls) => {
    const match = /^block-interactivity-(.+)$/.exec(cls);
    if (match) {
      wrapper.classList.add(`allow-interactivity-${match[1]}`);
    }
  });
}

function ensureSkipButton(popover: PopoverDOM, skipLabel: string) {
  const existing = popover.footerButtons.querySelector<HTMLButtonElement>(
    ".driver-popover-skip-btn",
  );
  if (existing) {
    existing.textContent = skipLabel;
    return;
  }

  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "driver-popover-skip-btn driver-popover-footer-btn";
  skip.textContent = skipLabel;
  skip.setAttribute("aria-label", skipLabel);
  skip.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    destroyActiveTour();
  });
  popover.footerButtons.insertBefore(skip, popover.footerButtons.firstChild);
}

function enhancePopover(popover: PopoverDOM, options: RunTourOptions) {
  applyDir(popover.wrapper);
  unlockPopoverForModals(popover.wrapper);
  ensureSkipButton(popover, options.skip);
}

function baseConfig(options: RunTourOptions): Config {
  return {
    animate: true,
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 12,
    allowClose: true,
    // Highlighted drawer/workspace must stay fillable; overlay click dismisses the tour.
    disableActiveInteraction: false,
    overlayClickBehavior: "close",
    smoothScroll: true,
    popoverClass: GUIDANCE_POPOVER_CLASS,
    showProgress: options.showProgress ?? true,
    skipMissingElement: true,
    nextBtnText: options.next,
    prevBtnText: options.previous,
    doneBtnText: options.done,
    progressText: options.progress,
    onPopoverRender: (popover) => enhancePopover(popover, options),
    onDestroyed: () => {
      activeDriver = null;
      options.onDestroyed?.();
    },
  };
}

export function destroyActiveTour() {
  tourGeneration += 1;
  if (activeDriver?.isActive()) {
    activeDriver.destroy();
  }
  activeDriver = null;
}

export function isTourActive(): boolean {
  return Boolean(activeDriver?.isActive());
}

/** Loads driver.js on demand — keeps the tour library off the critical path. */
export function startTour(steps: TourStepDef[], options: RunTourOptions): void {
  destroyActiveTour();
  const generation = tourGeneration;

  void ensureDriverModule()
    .then(({ driver }) => {
      if (generation !== tourGeneration) return;

      const instance = driver({
        ...baseConfig(options),
        steps: buildTourSteps(steps),
      });

      if (generation !== tourGeneration) {
        instance.destroy();
        return;
      }

      activeDriver = instance;
      instance.drive();
    })
    .catch(() => {
      // Tour is optional UX — never break the page if the chunk fails to load.
    });
}

export function startCoachMarks(steps: TourStepDef[], options: RunTourOptions): void {
  startTour(steps, { ...options, showProgress: false });
}
