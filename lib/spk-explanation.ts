type StatusSpk = "layak" | "cadangan" | "tidak_layak" | string | null | undefined;

export function formatStatusSpk(status: StatusSpk) {
  const map: Record<string, string> = {
    layak: "Layak",
    cadangan: "Cadangan",
    tidak_layak: "Tidak Layak",
  };

  if (!status) return "-";

  return map[String(status)] || String(status);
}

export function getStatusSpkClass(status: StatusSpk) {
  const map: Record<string, string> = {
    layak: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cadangan: "border-blue-200 bg-blue-50 text-blue-700",
    tidak_layak: "border-red-200 bg-red-50 text-red-700",
  };

  if (!status) return "border-slate-200 bg-slate-50 text-slate-600";

  return map[String(status)] || "border-slate-200 bg-slate-50 text-slate-600";
}

export function getStatusSpkTitle(status: StatusSpk) {
  if (status === "layak") {
    return "Keluarga masuk prioritas penerima bantuan.";
  }

  if (status === "cadangan") {
    return "Keluarga masuk daftar cadangan.";
  }

  if (status === "tidak_layak") {
    return "Keluarga belum masuk prioritas bantuan.";
  }

  return "Status hasil belum tersedia.";
}

export function getStatusSpkDescription(status: StatusSpk) {
  if (status === "layak") {
    return "Status layak berarti keluarga termasuk dalam kelompok prioritas berdasarkan hasil perhitungan metode AHP-SAW. Nilai akhir dan ranking menunjukkan keluarga ini memenuhi tingkat prioritas yang ditentukan sistem.";
  }

  if (status === "cadangan") {
    return "Status cadangan berarti keluarga memiliki nilai yang cukup baik, tetapi belum masuk kuota utama penerima bantuan. Data ini tetap dapat dipertimbangkan jika ada tambahan kuota atau perubahan keputusan admin.";
  }

  if (status === "tidak_layak") {
    return "Status tidak layak berarti keluarga belum termasuk dalam prioritas bantuan berdasarkan hasil perhitungan saat ini. Hal ini bukan berarti data tidak valid, tetapi nilai prioritasnya berada di bawah keluarga lain.";
  }

  return "Hasil perhitungan belum tersedia. Admin perlu menjalankan proses perhitungan AHP-SAW terlebih dahulu.";
}

export function getRankingExplanation(ranking?: number | null) {
  if (!ranking) {
    return "Ranking belum tersedia karena perhitungan belum dilakukan.";
  }

  if (ranking === 1) {
    return "Ranking 1 berarti keluarga ini berada pada prioritas tertinggi dalam hasil perhitungan.";
  }

  return `Ranking ${ranking} berarti keluarga ini berada pada urutan ke-${ranking} dalam daftar prioritas bantuan. Semakin kecil ranking, semakin tinggi prioritasnya.`;
}

export function getScoreExplanation(score?: number | null) {
  if (score === null || score === undefined) {
    return "Nilai akhir belum tersedia.";
  }

  if (score >= 0.8) {
    return "Nilai akhir tergolong tinggi, sehingga keluarga memiliki tingkat prioritas yang kuat berdasarkan kriteria yang digunakan.";
  }

  if (score >= 0.6) {
    return "Nilai akhir tergolong sedang hingga baik. Keluarga masih memiliki peluang prioritas tergantung kuota atau ambang batas yang digunakan.";
  }

  return "Nilai akhir tergolong rendah dibandingkan data lain, sehingga prioritas bantuan menjadi lebih kecil.";
}

export function getMethodExplanation() {
  return "AHP digunakan untuk menentukan bobot setiap kriteria, sedangkan SAW digunakan untuk menghitung nilai akhir dan ranking keluarga berdasarkan bobot tersebut.";
}