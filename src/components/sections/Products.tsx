import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Check } from "lucide-react";
import gardImg from "@/assets/produs-garduri.jpg";
import tiglaImg from "@/assets/produs-tigla.jpg";
import { Reveal } from "@/components/Reveal";
import { MetalButton } from "@/components/ui/metal-button";
import { useLead, type ProjectType } from "@/components/lead/LeadContext";

type Card = {
  title: string;
  desc: string;
  img: string;
  alt: string;
  benefits: string[];
  cta: string;
  type: ProjectType;
};

const CARDS: Card[] = [
  {
    title: "Garduri metalice",
    desc: "Gamă completă MX, DUO și casetat — design tip jaluzea, profile rigidizate și intimitate reglabilă.",
    img: gardImg,
    alt: "Panou de gard metalic tip jaluzea în nuanță antracit",
    benefits: [
      "Modele MX 15 / 25 / 60, DUO și casetat",
      "Toată paleta RAL, finisaje mat și lemn",
      "Tablă zincată cu strat de protecție",
      "Producție proprie, livrare în toată țara",
    ],
    cta: "Vreau ofertă pentru gard",
    type: "gard",
  },
  {
    title: "Țiglă metalică & tablă click",
    desc: "Daily, Briliant, Nobel și sistemele Smart, plus tablă click Canto pentru linii moderne.",
    img: tiglaImg,
    alt: "Acoperiș din țiglă metalică antracit pe o casă modernă",
    benefits: [
      "Sisteme complete cu accesorii originale",
      "Montaj rapid, greutate redusă pe șarpantă",
      "Rezistență la intemperii și decolorare",
      "Transport gratuit la locația ta",
    ],
    cta: "Vreau ofertă pentru acoperiș",
    type: "acoperis",
  },
];

function TiltCard({ card, index }: { card: Card; index: number }) {
  const { openForm } = useLead();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  return (
    <Reveal delay={index * 0.1}>
      <motion.article
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-hard)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={card.img}
            alt={card.alt}
            loading="lazy"
            width={1200}
            height={900}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-7">
          <h3 className="text-2xl font-bold uppercase">{card.title}</h3>
          <p className="mt-3 text-sm text-muted-foreground">{card.desc}</p>
          <ul className="mt-6 space-y-3">
            {card.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-2">
            <MetalButton onClick={() => openForm(card.type)}>{card.cta}</MetalButton>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function Products() {
  return (
    <section id="produse" className="section-pad relative">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <p className="eyebrow">Produse</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold uppercase sm:text-5xl">
            Explorați gama noastră variată de produse moderne
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Țiglă metalică, garduri metalice, fațade casetate și tablă click — soluții complete
            pentru proiecte rezidențiale și comerciale.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {CARDS.map((c, i) => (
            <TiltCard key={c.title} card={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
