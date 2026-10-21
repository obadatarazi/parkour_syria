import type { ReactNode } from "react";

/**
 * Long-content form layout for a `full` size popup: the writing area takes the room, settings
 * (image, publishing, SEO) sit in a side column, stacked under it on narrow screens.
 */
export function CrudEditorLayout({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">{main}</div>
      <aside className="min-w-0 space-y-4">{aside}</aside>
    </div>
  );
}
