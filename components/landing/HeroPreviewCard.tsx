import { heroStats, rankingPreview } from "@/constants/landing";
import { cn } from "@/lib/cn";
import { StatCard } from "./StatCard";

export function HeroPreviewCard() {
  return (
    <div className="mt-14 hidden lg:block">
      <div className="ml-auto max-w-xl rounded-[2rem] border border-white/20 bg-white/12 p-5 shadow-2xl backdrop-blur">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#555555]">Dashboard SPK</p>
              <h2 className="mt-1 text-2xl font-semibold text-black">
                Hasil Perhitungan
              </h2>
            </div>

            <span className="rounded-full bg-[#C7EABB] px-4 py-2 text-sm font-semibold text-[#1B5E20]">
              AHP + SAW
            </span>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-4">
            {heroStats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                variant={stat.variant}
              />
            ))}
          </div>

          <div className="mt-7 space-y-3">
            {rankingPreview.map((item) => (
              <div
                key={item.rank}
                className="grid grid-cols-[48px_1fr_72px_96px] items-center rounded-2xl bg-[#F5F7F6] px-4 py-3 text-sm"
              >
                <span className="font-bold text-[#1B5E20]">#{item.rank}</span>
                <span className="font-medium text-black">{item.nama}</span>
                <span className="font-semibold text-[#263238]">
                  {item.nilai}
                </span>
                <span
                  className={cn(
                    "text-right font-semibold",
                    item.status === "Layak"
                      ? "text-[#1B5E20]"
                      : "text-red-600"
                  )}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}