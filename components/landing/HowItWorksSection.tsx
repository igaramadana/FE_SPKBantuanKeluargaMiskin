import { caraKerja } from "@/constants/landing";
import { HowItWorksCard } from "./HowItWorksCard";

export function HowItWorksSection() {
  return (
    <section className="bg-[#F5F8F1] px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-normal text-black md:text-4xl">
            Bagaimana Sistem Ini Bekerja?
          </h2>
          <p className="mt-5 text-lg text-[#555555]">
            Proses penentuan penerima bantuan dilakukan secara sistematis dan
            terstruktur.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {caraKerja.map((item, index) => (
            <HowItWorksCard
              key={item.title}
              index={index + 1}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}