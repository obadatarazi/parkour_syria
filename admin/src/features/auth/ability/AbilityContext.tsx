import { createContextualCan } from "@casl/react";
import { createContext, useContext } from "react";

import { createAbility } from "@/features/auth/ability/createAbility";
import type { AppAbility } from "@/features/auth/ability/types";

export const AbilityContext = createContext<AppAbility>(createAbility([]));

export const Can = createContextualCan(AbilityContext.Consumer);

export function useAbility(): AppAbility {
  return useContext(AbilityContext);
}
