import { apiGet, apiPost } from "@/lib/api";
import type { Kriteria, KriteriaCreatePayload } from "@/types/kriteria";

export function ambilSemuaKriteria() {
    return apiGet<Kriteria[]>("/kriteria");
}

export function bikinKriteriaBaru(payload: KriteriaCreatePayload) {
    return apiPost<Kriteria, KriteriaCreatePayload>("/kriteria", payload);
}