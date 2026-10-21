import type { PaymentProvidersService } from "@/features/payment-providers/services/payment-providers.service.types";
import { createApiPaymentProvidersService } from "@/features/payment-providers/services/payment-providers-api.service";

export const paymentProvidersService: PaymentProvidersService =
  createApiPaymentProvidersService();
