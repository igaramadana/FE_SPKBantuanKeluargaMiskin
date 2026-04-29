import { fiturUtama } from "@/constants/landing";
import { FeatureCard } from "./FeatureCard";

export function FeatureSection() {
  return (
    <section id="tentang" className="bg-white px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-normal text-black md:text-4xl">
            Keputusan Tepat, Bantuan Sampai
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#555555]">
            Sistem kami membantu masyarakat memastikan bantuan sosial diberikan
            kepada keluarga yang benar-benar membutuhkan.
          </p>
        </div>

        <div id="fitur" className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {fiturUtama.map((fitur) => (
            <FeatureCard
              key={fitur.title}
              title={fitur.title}
              description={fitur.description}
              icon={fitur.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}