import Link from "next/link";
import { helpCenterContact } from "@/constants/help-center";

export function HelpContactSection() {
  return (
    <section className="relative overflow-hidden bg-[#0F3D1A] px-5 py-20 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(199,234,187,0.25),_transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {helpCenterContact.title}
          </h2>
          <p className="mt-3 text-sm text-white/80 md:text-base">
            Tim kami siap membantu melalui berbagai kanal resmi. Pilih jalur
            komunikasi yang paling nyaman untuk Anda.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {helpCenterContact.items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#C7EABB]">
                  <Icon className="h-6 w-6 text-[#1B5E20]" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">
                    {item.label}
                  </p>

                  {item.type === "phone" ? (
                    <Link
                      href={`tel:${item.value}`}
                      className="mt-2 block text-lg font-semibold text-white hover:text-[#C7EABB] transition"
                    >
                      {item.value}
                    </Link>
                  ) : item.type === "email" ? (
                    <Link
                      href={`mailto:${item.value}`}
                      className="mt-2 block text-lg font-semibold text-white hover:text-[#C7EABB] transition"
                    >
                      {item.value}
                    </Link>
                  ) : item.type === "whatsapp" ? (
                    <Link
                      href={`https://wa.me/${item.value.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-lg font-semibold text-white hover:text-[#C7EABB] transition"
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <p className="mt-2 whitespace-pre-line text-lg font-semibold text-white">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
