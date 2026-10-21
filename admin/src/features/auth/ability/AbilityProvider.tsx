import { type ReactNode, useMemo } from "react";

import { AbilityContext } from "@/features/auth/ability/AbilityContext";
import { collectUserPermissions, createAbility } from "@/features/auth/ability/createAbility";
import { useAuth } from "@/features/auth/providers/AuthProvider";

export function AbilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const ability = useMemo(
    () => createAbility(collectUserPermissions(user?.roles)),
    [user?.roles],
  );

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
