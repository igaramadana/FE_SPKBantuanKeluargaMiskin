import Link from "next/link";
import { contactData } from "@/constants/contact";

export function ContactSection() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-white px-5 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mt-6 text-4xl font-bold text-[#0F3D1A] md:text-5xl">
            Kami Siap Membantu Anda
          </h1>

          <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg">
            Jika Anda memiliki pertanyaan terkait Sistem Pendukung Keputusan
            Bantuan Keluarga Miskin, silakan hubungi kami melalui salah satu
            kanal resmi berikut. Tim kami siap membantu memberikan informasi
            dan dukungan yang Anda perlukan.
          </p>
        </div>
      </section>

      {/* Contact Services */}
      <section className="bg-gray-50 px-5 py-20 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#0F3D1A]">
              Pilihan Layanan
            </h2>

            <p className="mt-3 text-gray-600">
              Pilih media komunikasi yang paling nyaman untuk Anda gunakan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {contactData.items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C7EABB]">
                    <Icon className="h-7 w-7 text-[#1B5E20]" />
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                      {item.label}
                    </p>

                    {item.type === "phone" ? (
                      <Link
                        href={`tel:${item.value}`}
                        className="mt-2 block text-lg font-semibold text-[#0F3D1A] transition hover:text-[#2E7D32]"
                      >
                        {item.value}
                      </Link>
                    ) : item.type === "email" ? (
                      <Link
                        href={`mailto:${item.value}`}
                        className="mt-2 block text-lg font-semibold text-[#0F3D1A] transition hover:text-[#2E7D32]"
                      >
                        {item.value}
                      </Link>
                    ) : item.type === "whatsapp" ? (
                      <Link
                        href={`https://wa.me/${item.value.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-lg font-semibold text-[#0F3D1A] transition hover:text-[#2E7D32]"
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <p className="mt-2 whitespace-pre-line text-lg font-semibold text-[#0F3D1A]">
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
    </>
  );
}