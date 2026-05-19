// services/saw.service.ts
import { apiGet, apiPost } from "@/lib/api";
import type {
  SawCalculateFromDbPayload,
  SawCalculateFromDbResponse,
  SawResult,
} from "@/types/saw";

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
  return apiGet<
    {
      id: string;
      nama_perhitungan: string;
      metode: string;
      jumlah_data: number;
      consistency_ratio?: string | null;
      mode_status: string;
      threshold?: string | null;
      kuota?: number | null;
      tanggal_hitung: string;
    }[]
  >("/saw/riwayat");
}