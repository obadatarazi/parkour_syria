import type { UsersService } from "@/features/users/services/users.service.types";
import { createApiUsersService } from "@/features/users/services/users-api.service";

export const usersService: UsersService = createApiUsersService();
