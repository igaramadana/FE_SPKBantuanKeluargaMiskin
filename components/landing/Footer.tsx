export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white px-5 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#555555] md:flex-row">
        <p>© {new Date().getFullYear()} SPK Bantuan Keluarga Miskin.</p>
        <p>Metode AHP & SAW untuk Sistem Pendukung Keputusan.</p>
      </div>
    </footer>
  );
}