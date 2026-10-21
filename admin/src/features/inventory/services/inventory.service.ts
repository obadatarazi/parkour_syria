import type { InventoryService } from "@/features/inventory/services/inventory.service.types";
import { createApiInventoryService } from "@/features/inventory/services/inventory-api.service";

export const inventoryService: InventoryService = createApiInventoryService();
