import { appToast } from "@/shared/lib/toast";

type NotificationMessage = {
  message: string;
  description?: string;
};

type NotifyOptions = {
  /** Reuse an existing toast id (e.g. replace a loading toast). */
  id?: string | number;
};

/**
 * Application notification API.
 * Wraps Sonner internally — use this instead of importing Sonner directly.
 */
export const notify = {
  success(message: string, description?: string, options?: NotifyOptions) {
    appToast.success(message, description, options?.id);
  },

  error(message: string, description?: string, options?: NotifyOptions) {
    appToast.error(message, description, options?.id);
  },

  warning(message: string, description?: string, options?: NotifyOptions) {
    appToast.warning(message, description, options?.id);
  },

  info(message: string, description?: string, options?: NotifyOptions) {
    appToast.info(message, description, options?.id);
  },

  /** Form or client-side validation feedback — uses warning style. */
  validation(message: string, description?: string, options?: NotifyOptions) {
    appToast.warning(message, description, options?.id);
  },

  loading(message: string) {
    return appToast.loading(message);
  },

  dismiss(id?: string | number) {
    appToast.dismiss(id);
  },

  from({ message, description }: NotificationMessage, variant: "success" | "error" | "warning" | "info" = "info") {
    notify[variant](message, description);
  },
};
