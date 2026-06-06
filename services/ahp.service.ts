import { apiPost } from "@/lib/api";
import type {
  AhpCalculatePayload,
  AhpCalculateResponse,
} from "@/types/ahp";

export function hitungAhp(payload: AhpCalculatePayload) {
  return apiPost<AhpCalculateResponse, AhpCalculatePayload>(
    "/ahp/calculate",
    payload
  );
}