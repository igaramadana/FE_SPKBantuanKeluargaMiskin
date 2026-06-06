export type JenisKriteria = "benefit" | "cost";

export type SubKriteria = {
    id: string;
    kriteria_id: string;
    nama: string;
    nilai: string | number;
    created_at: string;
    updated_at: string;
};

export type Kriteria = {
    id: string;
    kode: string;
    nama: string;
    jenis: JenisKriteria;
    bobot_ahp?: number | string;
    aktif: boolean;
    urutan?: number | null;
    sub_kriteria?: SubKriteria[];
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