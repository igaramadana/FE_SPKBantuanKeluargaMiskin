import { apiGet, apiPost, apiPut } from "@/lib/api";
import type {
    Kriteria,
    KriteriaCreatePayload,
    KriteriaUpdatePayload,
} from "@/types/kriteria";

export function ambilSemuaKriteria() {
    return apiGet<Kriteria[]>("/kriteria");
}

export function bikinKriteriaBaru(payload: KriteriaCreatePayload) {
    return apiPost<Kriteria, KriteriaCreatePayload>("/kriteria", payload);
}

export function updateKriteria(kriteriaId: string, payload: KriteriaUpdatePayload) {
    return apiPut<Kriteria, KriteriaUpdatePayload>(
        `/kriteria/${kriteriaId}`,
        payload
    );
}