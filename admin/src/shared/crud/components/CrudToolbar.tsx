import { type ReactNode } from "react";

import { Toolbar } from "@/shared/components";

type CrudToolbarProps = {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
};

export function CrudToolbar({ search, filters, actions }: CrudToolbarProps) {
  return (
    <Toolbar
      start={
        <>
          {search}
          {filters}
        </>
      }
      end={actions}
    />
  );
}
