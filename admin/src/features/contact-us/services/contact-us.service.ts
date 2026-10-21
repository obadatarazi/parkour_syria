import type { ContactUsService } from "@/features/contact-us/services/contact-us.service.types";
import { createApiContactUsService } from "@/features/contact-us/services/contact-us-api.service";

export const contactUsService: ContactUsService = createApiContactUsService();
