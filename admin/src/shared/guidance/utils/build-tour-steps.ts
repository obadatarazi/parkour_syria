import type { DriveStep } from "driver.js";

import type { TourStepDef } from "@/shared/guidance/types/guidance.types";

export function buildTourSteps(steps: TourStepDef[]): DriveStep[] {
  return steps.map((step) => {
    const advanceOnClick = Boolean(step.advanceOnClick);

    return {
      ...(step.anchor
        ? { element: `[data-guidance="${step.anchor}"]` as string | undefined }
        : {}),
      popover: {
        title: step.title,
        description: step.description,
        ...(step.side ? { side: step.side } : {}),
        ...(step.align ? { align: step.align } : {}),
        // Click-driven steps: user must click the highlight (or Skip). Hiding Next
        // avoids advancing into a waitForElement hang while the drawer is still closed.
        ...(advanceOnClick ? { showButtons: ["previous", "close"] as const } : {}),
      },
      // Default to skipping missing anchors so tours never freeze on absent UI.
      skipMissingElement: step.skipIfMissing ?? Boolean(step.anchor),
      advanceOnClick,
      ...(step.waitForElement != null ? { waitForElement: step.waitForElement } : {}),
      ...(step.clickToActivate
        ? {
            onHighlightStarted: (element: Element | undefined) => {
              if (element instanceof HTMLElement) {
                element.click();
              }
            },
          }
        : {}),
    };
  });
}
