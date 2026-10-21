/**
 * Shared mock utilities for simulating network latency during development.
 * Future API implementations can use the same helpers for consistent test behavior.
 */
export function mockDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a typed mock list with optional count for pagination testing.
 */
export function createMockList<T>(factory: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}
