export function AboutFooter() {
  return (
    <footer className="bg-[#062010] px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#1B5E20]">
            SPK
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              SPK Bantuan Keluarga Miskin
            </p>
            <p className="mt-1 text-xs text-[#EAFFEB]/80">
              © {new Date().getFullYear()} SPK Bantuan Keluarga Miskin.
              Transparansi untuk Negeri.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 text-xs text-emerald-100/60">
          <a href="#">Kebijakan Privasi</a>
          <a href="#">Syarat & Ketentuan</a>
          <a href="#">Kontak Kami</a>
        </div>
      </div>
    </footer>
  );
}