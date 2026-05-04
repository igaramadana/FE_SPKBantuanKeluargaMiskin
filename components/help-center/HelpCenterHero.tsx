import { helpCenterHero } from "@/constants/help-center";

export function HelpCenterHero() {
  return (
    <section
      id="pusat-bantuan"
      className="relative min-h-[400px] overflow-hidden bg-cover bg-center px-5 py-24 md:px-8"
      style={{
        backgroundImage: `url('https://c.pxhere.com/photos/75/f8/giving_offering_dana_give_offering_requisite_charity_aid_gift-1367013.jpg!d')`
      }}
    >
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#1B5E20] md:text-5xl lg:text-6xl">
          {helpCenterHero.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/90 md:text-xl">
          {helpCenterHero.description}
        </p>
      </div>
    </section>
  );
}
