import Link from "next/link";
import { helpCenterContact } from "@/constants/help-center";

export function HelpContactSection() {
  return (
    <section className="bg-[#1B5E20] px-5 py-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
          {helpCenterContact.title}
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {helpCenterContact.items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-lg bg-white/10 p-6 backdrop-blur-sm transition hover:bg-white/15"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C7EABB] flex-shrink-0">
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
