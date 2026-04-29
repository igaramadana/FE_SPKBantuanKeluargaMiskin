import { authBenefits, authBrand } from "@/constants/auth";
import { HandHeart } from "lucide-react";

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#84B179]/50 lg:flex lg:w-[48%]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,94,32,0.08),rgba(27,94,32,0.72))]" />

      <div className="absolute inset-0 opacity-30 mix-blend-multiply">
        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_18%,#C7EABB_0,transparent_32%),radial-gradient(circle_at_80%_70%,#3F7D47_0,transparent_30%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col justify-center px-16 py-16 xl:px-24">
        <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-white/20 text-white shadow-xl backdrop-blur">
          <HandHeart className="h-20 w-20" />
        </div>

        <h1 className="mt-12 max-w-2xl text-5xl font-extrabold leading-tight text-white xl:text-7xl">
          SPK BANTUAN
          <br />
          KELUARGA
          <br />
          MISKIN
        </h1>

        <p className="mt-10 max-w-xl text-2xl font-medium italic leading-snug text-[#3F7D47] xl:text-3xl">
          “{authBrand.quote}”
        </p>

        <div className="mt-16 space-y-7">
          {authBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white shadow-md">
                  <Icon className="h-7 w-7" />
                </div>

                <p className="text-xl font-medium italic text-white">
                  {benefit.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}