import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
const ceoImg = "/images/ceo.jpg";
import { Reveal } from "@/components/Reveal";

const STATS = [
  { value: 14, suffix: "+", label: "ani de experiență" },
  { value: 20000, suffix: "+", label: "proiecte finalizate" },
  { value: 4, suffix: "", label: "puncte de lucru" },
  { value: 100, suffix: "%", label: "producție proprie" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl font-bold text-primary sm:text-5xl">
      {n.toLocaleString("ro-RO")}
      {suffix}
    </span>
  );
}

export function About() {
  return (
    <section id="despre" className="section-pad relative">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
        <Reveal>
          <motion.div
            whileHover="hover"
            className="group relative mx-auto max-w-md overflow-hidden rounded-md p-[1.5px] metal-surface"
          >
            <div className="relative overflow-hidden rounded-[5px] bg-card">
              <img
                src={ceoImg}
                alt="Iulian, director Metallic Group"
                loading="lazy"
                width={900}
                height={1100}
                className="h-full w-full object-cover"
              />
              <motion.div
                variants={{ hover: { x: ["-120%", "120%"] } }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card to-transparent p-6 pt-16">
                <p className="font-display text-lg font-bold uppercase">Iulian</p>
                <p className="text-sm text-primary">Director, Metallic Group</p>
              </div>
            </div>
          </motion.div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Despre noi</p>
            <blockquote className="mt-4 text-2xl leading-snug font-bold uppercase sm:text-4xl">
              „Scopul nostru este de a oferi clienților soluții potrivite și durabile pentru
              locuința lor”
            </blockquote>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Ne angajăm să oferim un serviciu de excepție, de la momentul consultării inițiale
                până la instalarea finală și dincolo de aceasta.
              </p>
              <p>
                Sistemul de învelitori este mai mult decât un simplu material de acoperiș: este
                rezultatul a ani de cercetare și dezvoltare, conceput pentru o performanță de
                neegalat în durabilitate și rezistență la intemperii.
              </p>
              <p>
                Aceasta este promisiunea noastră pentru fiecare client Metallic Group — un produs
                sigur, durabil și de înaltă calitate, care transformă orice casă într-un cămin.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-8 border-t border-border pt-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <Counter value={s.value} suffix={s.suffix} />
                <p className="mt-2 text-xs tracking-wider text-muted-foreground uppercase">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
