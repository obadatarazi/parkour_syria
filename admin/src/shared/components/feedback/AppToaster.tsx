import { Toaster } from "sonner";

import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function AppToaster() {
  const { direction } = useLocalization();

  return (
    <Toaster
      dir={direction}
      position={direction === "rtl" ? "top-left" : "top-right"}
      closeButton
      richColors
      gap={12}
      offset={16}
      toastOptions={{
        classNames: {
          toast: "border border-border bg-popover text-popover-foreground shadow-lg",
        },
      }}
    />
  );
}
