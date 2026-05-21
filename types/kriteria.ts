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
    kode: string;
    nama: string;
    jenis: JenisKriteria;
    aktif?: boolean;
    urutan?: number;
};

export type KriteriaUpdatePayload = {
    kode?: string;
    nama?: string;
    jenis?: JenisKriteria;
    aktif?: boolean;
    urutan?: number;
    bobot_ahp?: string | null;
};