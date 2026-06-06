export type AhpComparisonItem = {
  kriteria_1_id: string;
  kriteria_2_id: string;
  nilai: number;
};

export type AhpCalculatePayload = {
  perbandingan: AhpComparisonItem[];
  simpan_bobot: boolean;
};

export type AhpWeightResult = {
  kriteria_id: string;
  kode?: string;
  nama?: string;
  bobot: number;
};

export type AhpCalculateResponse = {
  message: string;
  weights: AhpWeightResult[];
  lambda_max: number;
  consistency_index: number;
  consistency_ratio: number;
  is_consistent: boolean;
  data?: {
    matrix: number[][];
    normalized_matrix: number[][];
    column_sums: number[];
  };
};