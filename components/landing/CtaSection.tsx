import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { landingCta } from "@/constants/landing";

export function CtaSection() {
  const Icon = landingCta.icon;

  return (
    <section id="kontak" className="bg-[#F5F8F1] px-5 pb-24 md:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-[#C7EABB] p-6 md:p-9">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-5">
            <div className="hidden h-20 w-20 items-center justify-center rounded-2xl bg-white text-[#1B5E20] md:flex">
              <Icon className="h-10 w-10" />
            </div>

            <div>
              <h2 className="text-2xl font-normal text-black">
                {landingCta.title}
              </h2>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#555555] md:text-lg">
                {landingCta.description}
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#144A18]"
          >
            {landingCta.action}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}