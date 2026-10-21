/**
 * Cross-cutting types shared across features.
 * Feature-specific types remain inside each feature module.
 */
export type AsyncStatus = "idle" | "pending" | "success" | "error";
