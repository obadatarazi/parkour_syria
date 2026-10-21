import { type SyntheticEvent } from "react";

import { destroyActiveTour, isTourActive } from "@/shared/guidance/tours/run-tour";

/**
 * Portaled overlays (date picker, selects, dropdowns) mount on `document.body`.
 * Radix Dialog/Sheet treat clicks on them as "outside" and would dismiss the
 * parent drawer/dialog — which also unmounts the nested popover.
 */
const PORTALED_OVERLAY_SELECTORS = [
  "[data-slot='popover-content']",
  "[data-slot='calendar']",
  "[data-slot='dropdown-menu-content']",
  "[data-slot='select-content']",
  "[data-radix-popper-content-wrapper]",
  "[data-radix-select-viewport]",
].join(", ");

function eventTargetElement(event: Event | SyntheticEvent): Element | null {
  const target = "target" in event ? event.target : null;
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

export function isPortaledOverlayTarget(event: Event | SyntheticEvent): boolean {
  const element = eventTargetElement(event);
  return Boolean(element?.closest(PORTALED_OVERLAY_SELECTORS));
}

export function preventOverlayDismiss(isLoading: boolean) {
  return (event: Event | SyntheticEvent) => {
    if (isLoading || isTourActive() || isPortaledOverlayTarget(event)) {
      event.preventDefault();
    }
  };
}

export function handleOverlayEscape(isLoading: boolean) {
  return (event: Event | SyntheticEvent) => {
    if (isLoading) {
      event.preventDefault();
      return;
    }
    if (isTourActive()) {
      event.preventDefault();
      destroyActiveTour();
    }
  };
}
