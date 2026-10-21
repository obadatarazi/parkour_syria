import type {
  Prescription,
  PrescriptionFormData,
  PrescriptionListParams,
  PrescriptionListResult,
} from "@/features/prescriptions/types/prescriptions.types";

export interface PrescriptionsService {
  list(params?: PrescriptionListParams, signal?: AbortSignal): Promise<PrescriptionListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Prescription>;
  getByNumber(prescriptionNumber: string, signal?: AbortSignal): Promise<Prescription>;
  resolveRouteKey(routeKey: string, signal?: AbortSignal): Promise<Prescription>;
  create(data: PrescriptionFormData): Promise<Prescription>;
  update(id: number, data: Partial<PrescriptionFormData>): Promise<Prescription>;
  delete(id: number): Promise<void>;
}
