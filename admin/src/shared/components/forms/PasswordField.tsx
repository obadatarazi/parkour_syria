import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";

import { AppButton } from "@/shared/components/buttons/AppButton";
import { TextField } from "@/shared/components/forms/TextField";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, "type" | "endAdornment"> & {
  autoComplete?: "current-password" | "new-password";
};

export function PasswordField({ autoComplete = "current-password", ...props }: PasswordFieldProps) {
  const t = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      type={isVisible ? "text" : "password"}
      autoComplete={autoComplete}
      endAdornment={
        <AppButton
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? t.hidePassword : t.showPassword}
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </AppButton>
      }
      {...props}
    />
  );
}
