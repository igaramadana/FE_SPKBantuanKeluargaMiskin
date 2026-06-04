import { apiGet, apiPost } from "@/lib/api";
import type {
  AutoGeneratePenilaianPayload,
  AutoGeneratePenilaianResponse,
  RiwayatSaw,
  SawCalculateFromDbPayload,
  SawCalculateFromDbResponse,
  SawResult,
  SimpanPenilaianSawPayload,
  SimpanPenilaianSawResponse,
} from "@/types/saw";

export function simpanPenilaianSaw(payload: SimpanPenilaianSawPayload) {
  return apiPost<SimpanPenilaianSawResponse, SimpanPenilaianSawPayload>(
    "/saw/penilaian",
    payload
  );
}

export function autoGeneratePenilaianDariImport(
  payload: AutoGeneratePenilaianPayload
) {
  return apiPost<AutoGeneratePenilaianResponse, AutoGeneratePenilaianPayload>(
    "/saw/penilaian/auto-generate-from-import",
    payload
  );
}

export function hitungSawDariDatabase(payload: SawCalculateFromDbPayload) {
  return apiPost<SawCalculateFromDbResponse, SawCalculateFromDbPayload>(
    "/saw/calculate-from-db",
    payload
  );
}

export function ambilHasilSawTerbaru() {
  return apiGet<SawResult[]>("/saw/hasil/latest");
}

export function ambilRiwayatSaw() {
  return apiGet<RiwayatSaw[]>("/saw/riwayat");
}