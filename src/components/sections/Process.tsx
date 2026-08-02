import { Reveal } from "@/components/Reveal";

const STEPS = [
  {
    title: "Consultanță gratuită",
    text: "Discutăm proiectul, dimensiunile și bugetul. Recomandăm modelul potrivit, fără obligații.",
  },
  {
    title: "Ofertă personalizată",
    text: "Primești o ofertă clară, cu produse, cantități, culori RAL și termen de livrare.",
  },
  {
    title: "Producție",
    text: "Producem gardul sau sistemul de acoperiș la dimensiunile tale, în fabrica proprie.",
  },
  {
    title: "Livrare & montaj",
    text: "Transportăm produsele la tine, iar montajul se face prin colaboratorii noștri certificați.",
  },
];

export function Process() {
  return (
    <section id="proces" className="section-pad relative border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <p className="eyebrow">Cum lucrăm</p>
          <h2 className="mt-3 text-3xl font-bold uppercase sm:text-5xl">
            De la prima discuție <span className="text-gold">la gardul montat</span>
          </h2>
        </Reveal>

        <div className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-7 right-0 left-0 hidden h-px bg-border lg:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-sm border border-primary/40 bg-background font-display text-lg font-bold text-primary">
                0{i + 1}
              </div>
              <h3 className="mt-6 font-display text-lg font-bold uppercase">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
