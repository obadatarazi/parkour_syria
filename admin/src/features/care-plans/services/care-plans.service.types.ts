import type {
  CarePlan,
  CarePlanFormData,
  CarePlanListParams,
  CarePlanListResult,
  CarePlanWidgetsSnapshot,
} from "@/features/care-plans/types/care-plans.types";

export interface CarePlansService {
  list(params?: CarePlanListParams, signal?: AbortSignal): Promise<CarePlanListResult>;
  getById(id: number, signal?: AbortSignal): Promise<CarePlan>;
  create(data: CarePlanFormData): Promise<CarePlan>;
  update(id: number, data: Partial<CarePlanFormData>): Promise<CarePlan>;
  delete(id: number): Promise<void>;
  pause(id: number): Promise<CarePlan>;
  resume(id: number): Promise<CarePlan>;
  cancel(id: number): Promise<CarePlan>;
  skipCycle(carePlanId: number, cycleId: number): Promise<CarePlan>;
  getWidgets(signal?: AbortSignal): Promise<CarePlanWidgetsSnapshot>;
}
