import { RouterProvider } from "react-router";

import { AppErrorBoundary } from "@/app/components/AppErrorBoundary";
import { router } from "@/app/router";
import { LocalizationProvider } from "@/shared/design-system/localization/contexts/LocalizationContext";

export default function App() {
  return (
    <LocalizationProvider>
      <AppErrorBoundary>
        {/* Show route Suspense fallbacks immediately instead of freezing on the previous page. */}
        <RouterProvider router={router} useTransitions={false} />
      </AppErrorBoundary>
    </LocalizationProvider>
  );
}
