import { toast } from "sonner";

export const appToast = {
  success: (message: string, description?: string, id?: string | number) =>
    toast.success(message, { description, id }),
  error: (message: string, description?: string, id?: string | number) =>
    toast.error(message, { description, id }),
  warning: (message: string, description?: string, id?: string | number) =>
    toast.warning(message, { description, id }),
  info: (message: string, description?: string, id?: string | number) =>
    toast.info(message, { description, id }),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
