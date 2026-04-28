export type JenisKriteria = "benefit" | "cost";

export type Kriteria = {
    id: string;
    kode: string;
    nama: string;
    jenis: JenisKriteria;
    bobot_ahp?: string | null;
    aktif: boolean;
    urutan?: number | null;
    created_at: string;
    updated_at: string
};

export type KriteriaCreatePayload = {
    kode: String;
    nama: String;
    jenis: JenisKriteria;
    aktif?: boolean;
    urutan?: number;
};