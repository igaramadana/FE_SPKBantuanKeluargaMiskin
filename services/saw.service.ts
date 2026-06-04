import { apiGet, apiPost } from "@/lib/api";
import type {
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