import { Outlet } from "react-router";

import { AbilityProvider, AuthProvider } from "@/features/auth";
import { AppToaster } from "@/shared/components";
import { GuidanceOverlayHost } from "@/shared/guidance/components/GuidanceOverlayHost";
import { GuidanceProvider } from "@/shared/guidance/context/GuidanceProvider";

export function AppProviders() {
  return (
    <AuthProvider>
      <AbilityProvider>
        <GuidanceProvider>
          <Outlet />
          <GuidanceOverlayHost />
          <AppToaster />
        </GuidanceProvider>
      </AbilityProvider>
    </AuthProvider>
  );
}
