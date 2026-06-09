export default function MetodologiPage() {
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">Metodologi SPK</h1>
        <p className="mt-2 text-gray-600">Sistem ini menggunakan kombinasi metode AHP dan SAW untuk membantu menentukan prioritas penerima bantuan keluarga miskin.</p>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold">Alur Sistem</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-gray-700">
          <li>Admin mengelola data keluarga sebagai alternatif penerima bantuan.</li>
          <li>Admin memverifikasi data keluarga dan dokumen pendukung.</li>
          <li>Admin menentukan kriteria dan sub-kriteria penilaian.</li>
          <li>Bobot kriteria dihitung menggunakan metode AHP.</li>
          <li>Nilai keluarga terhadap kriteria diinput manual atau dibuat dari import dataset.</li>
          <li>Metode SAW melakukan normalisasi nilai sesuai jenis benefit/cost.</li>
          <li>Nilai normalisasi dikalikan dengan bobot AHP untuk mendapatkan nilai akhir.</li>
          <li>Sistem membuat ranking dan status kelayakan berdasarkan threshold atau kuota.</li>
          <li>Admin dapat melakukan override status final dengan alasan yang jelas.</li>
          <li>Hasil akhir dapat diexport menjadi laporan PDF.</li>
        </ol>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold">Rumus SAW</h2>
        <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4 text-gray-700">
          <p>Untuk kriteria benefit: <span className="ml-2 font-semibold">Rij = Xij / Max(Xij)</span></p>
          <p>Untuk kriteria cost: <span className="ml-2 font-semibold">Rij = Min(Xij) / Xij</span></p>
          <p>Nilai akhir: <span className="ml-2 font-semibold">Vi = Σ(Wj × Rij)</span></p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold">Penentuan Status</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Mode Threshold</h3>
            <p className="mt-2 text-sm text-gray-600">Keluarga dinyatakan layak jika nilai akhir lebih besar atau sama dengan batas minimum yang ditentukan admin.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Mode Kuota</h3>
            <p className="mt-2 text-sm text-gray-600">Sistem mengambil ranking tertinggi sesuai jumlah kuota bantuan. Ranking berikutnya dapat masuk status cadangan.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
