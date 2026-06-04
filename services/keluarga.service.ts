import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  Keluarga,
  KeluargaCreatePayload,
  KeluargaMutationResponse,
  KeluargaUpdatePayload,
  VerifikasiKeluargaPayload,
} from "@/types/keluarga";

type AmbilKeluargaParams = {
  search?: string;
  status_verifikasi?: string;
  kelurahan?: string;
  dusun?: string;
};

function toQueryString(params?: AmbilKeluargaParams) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export function ambilSemuaKeluarga(params?: AmbilKeluargaParams) {
  return apiGet<Keluarga[]>(`/keluarga${toQueryString(params)}`);
}

export function ambilDetailKeluarga(id: string) {
  return apiGet<Keluarga>(`/keluarga/${id}`);
}

export function tambahKeluarga(payload: KeluargaCreatePayload) {
  return apiPost<KeluargaMutationResponse, KeluargaCreatePayload>(
    "/keluarga",
    payload
  );
}

export function updateKeluarga(id: string, payload: KeluargaUpdatePayload) {
  return apiPatch<KeluargaMutationResponse, KeluargaUpdatePayload>(
    `/keluarga/${id}`,
    payload
  );
}

export function hapusKeluarga(id: string) {
  return apiDelete<KeluargaMutationResponse>(`/keluarga/${id}`);
}

export function verifikasiKeluarga(
  id: string,
  payload: VerifikasiKeluargaPayload
) {
  return apiPatch<KeluargaMutationResponse, VerifikasiKeluargaPayload>(
    `/keluarga/${id}/verifikasi`,
    payload
  );
}