import { createApiInventoryService } from "@/features/inventory/services/inventory-api.service";
import type { InventoryService } from "@/features/inventory/services/inventory.service.types";

export const inventoryService: InventoryService = createApiInventoryService();
