import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api";
import type {
  Keluarga,
  KeluargaCreatePayload,
  KeluargaFilter,
  KeluargaUpdatePayload,
  StatusVerifikasi,
} from "@/types/keluarga";

export function ambilSemuaKeluarga(filter?: KeluargaFilter) {
  return apiGet<Keluarga[]>("/keluarga", filter);
}

export function ambilDetailKeluarga(id: string) {
  return apiGet<Keluarga>(`/keluarga/${id}`);
}

export function tambahKeluarga(payload: KeluargaCreatePayload) {
  return apiPost<Keluarga, KeluargaCreatePayload>("/keluarga", payload);
}

export function updateKeluarga(id: string, payload: KeluargaUpdatePayload) {
  return apiPut<Keluarga, KeluargaUpdatePayload>(`/keluarga/${id}`, payload);
}

export function hapusKeluarga(id: string) {
  return apiDelete<{ message: string; data: Keluarga }>(`/keluarga/${id}`);
}

export function verifikasiKeluarga(
  id: string,
  payload: {
    status_verifikasi: StatusVerifikasi;
    catatan_admin?: string;
  }
) {
  return apiPatch<Keluarga, typeof payload>(`/keluarga/${id}/verifikasi`, payload);
}