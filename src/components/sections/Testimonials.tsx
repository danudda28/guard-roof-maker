import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const REVIEWS = [
  {
    name: "Marian Bajenaru",
    city: "Client Google",
    text: "Mulțumesc pentru ajutorul acordat de către domnul Alexandru Croitoru, de la elaborarea ofertei până la detalii în amănunt despre montaj. O firmă excelentă, o recomand la toată lumea.",
  },
  {
    name: "Marcel Plopeanu",
    city: "Client Google",
    text: "Calitate, seriozitate, promptitudine și lucrare bine făcută. Recomand tuturor celor care au nevoie de un acoperiș de calitate.",
  },
  {
    name: "Corina Stefan",
    city: "Client Google",
    text: "O echipă cu valori reale, oneste, puse în lucru de oameni faini. Atenți la detalii și orientați spre clienți.",
  },
  {
    name: "Razvan Rosu",
    city: "Client Google",
    text: "Cei mai buni și calitativ de pe piață! Recomand cu toată încrederea.",
  },
  {
    name: "Laurențiu Urum",
    city: "Client Google",
    text: "Suntem foarte mulțumiți, sunt o echipă de profesioniști. Recomand.",
  },
  {
    name: "Grig Adamov",
    city: "Client Google",
    text: "Oameni amabili, serviabili, produsele corespund descrierii. Per total o experiență foarte plăcută!",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setI((v) => (v + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const r = REVIEWS[i]!;

  return (
    <section id="recenzii" className="section-pad">
      <div
        className="mx-auto max-w-4xl px-5 text-center"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <Reveal>
          <p className="eyebrow">Recenzii</p>
        </Reveal>
        <div className="relative mt-8 min-h-[240px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-6 text-xl leading-relaxed font-medium sm:text-2xl">„{r.text}”</p>
              <footer className="mt-6 font-display text-sm uppercase text-muted-foreground">
                {r.name} — {r.city}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {REVIEWS.map((_, d) => (
            <button
              key={d}
              aria-label={`Recenzia ${d + 1}`}
              onClick={() => setI(d)}
              className={`h-1.5 rounded-full transition-all ${d === i ? "w-8 bg-primary" : "w-3 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
