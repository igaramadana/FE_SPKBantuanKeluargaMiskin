import Image from "next/image";
import { authBenefits, authBrand } from "@/constants/auth";

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[48%]" style={{ background: "linear-gradient(160deg, #4e9958 0%, #2d6e35 40%, #1B5E20 100%)" }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#84B179]/20 blur-2xl" />
        {/* Grid pattern overlay */}
        <svg className="absolute inset-0 h-full w-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Village illustration SVG */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-20">
        <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg" className="w-full">
          {/* House 1 */}
          <rect x="30" y="130" width="80" height="70" fill="#fff" rx="4"/>
          <polygon points="30,130 70,90 110,130" fill="#c8e6c9"/>
          <rect x="55" y="165" width="25" height="35" fill="#a5d6a7"/>
          <rect x="35" y="145" width="20" height="15" fill="#e8f5e9" rx="2"/>
          <rect x="85" y="145" width="20" height="15" fill="#e8f5e9" rx="2"/>
          {/* House 2 */}
          <rect x="140" y="120" width="100" height="80" fill="#fff" rx="4"/>
          <polygon points="140,120 190,70 240,120" fill="#c8e6c9"/>
          <rect x="168" y="160" width="30" height="40" fill="#a5d6a7"/>
          <rect x="145" y="135" width="28" height="20" fill="#e8f5e9" rx="2"/>
          <rect x="207" y="135" width="28" height="20" fill="#e8f5e9" rx="2"/>
          {/* Tree 1 */}
          <rect x="270" y="155" width="10" height="45" fill="#795548"/>
          <ellipse cx="275" cy="130" rx="28" ry="35" fill="#66bb6a"/>
          <ellipse cx="255" cy="145" rx="20" ry="25" fill="#81c784"/>
          <ellipse cx="295" cy="145" rx="20" ry="25" fill="#81c784"/>
          {/* House 3 */}
          <rect x="330" y="115" width="90" height="85" fill="#fff" rx="4"/>
          <polygon points="330,115 375,70 420,115" fill="#c8e6c9"/>
          <rect x="356" y="158" width="28" height="42" fill="#a5d6a7"/>
          <rect x="335" y="130" width="25" height="18" fill="#e8f5e9" rx="2"/>
          <rect x="390" y="130" width="25" height="18" fill="#e8f5e9" rx="2"/>
          {/* Tree 2 */}
          <rect x="445" y="165" width="8" height="35" fill="#795548"/>
          <ellipse cx="449" cy="145" rx="22" ry="28" fill="#66bb6a"/>
          {/* House 4 small */}
          <rect x="480" y="140" width="70" height="60" fill="#fff" rx="4"/>
          <polygon points="480,140 515,110 550,140" fill="#c8e6c9"/>
          <rect x="503" y="170" width="22" height="30" fill="#a5d6a7"/>
          {/* Ground */}
          <rect x="0" y="195" width="600" height="25" fill="#81c784" rx="0"/>
          <ellipse cx="300" cy="195" rx="300" ry="10" fill="#66bb6a"/>
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col justify-center px-16 py-16 xl:px-24">
        {/* Icon */}
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/15 p-3 shadow-xl backdrop-blur-sm">
          <Image
            src="/logospkbansos.png"
            alt="SIMBANTU"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="mt-10 max-w-xl text-5xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-6xl">
          SPK BANTUAN
          <br />
          <span className="text-[#a5d6a7]">KELUARGA</span>
          <br />
          MISKIN
        </h1>

        {/* Quote */}
        <p className="mt-8 max-w-sm text-lg font-medium italic leading-relaxed text-white/70">
          &ldquo;{authBrand.quote}&rdquo;
        </p>

        {/* Divider */}
        <div className="mt-10 h-px w-24 bg-white/30" />

        {/* Benefits */}
        <div className="mt-10 space-y-6">
          {authBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white shadow-sm backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-base font-semibold italic text-white/90">
                  {benefit.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom badge */}
        <div className="mt-16 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 border border-white/20 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#69f0ae] animate-pulse" />
          <span className="text-sm font-medium text-white/80">Sistem Aktif</span>
        </div>
      </div>
    </aside>
  );
}