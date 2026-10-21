import type { RolesService } from "@/features/roles/services/roles.service.types";
import { createApiRolesService } from "@/features/roles/services/roles-api.service";

export const rolesService: RolesService = createApiRolesService();
