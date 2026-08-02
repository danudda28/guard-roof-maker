import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import p1 from "@/assets/proiect-1.jpg";
import p2 from "@/assets/proiect-2.jpg";
import p3 from "@/assets/proiect-3.jpg";
import p4 from "@/assets/proiect-4.jpg";
import { Reveal } from "@/components/Reveal";

type Cat = "toate" | "garduri" | "acoperisuri";

const PROJECTS = [
  { img: p1, cat: "garduri", title: "Gard MX 25 cu poartă batantă", alt: "Gard metalic antracit cu poartă în fața unei case" },
  { img: p2, cat: "acoperisuri", title: "Țiglă metalică Nobel", alt: "Acoperiș din țiglă metalică neagră pe o casă de familie" },
  { img: p3, cat: "garduri", title: "Gard MX 15 DUO, RAL 8017", alt: "Gard metalic maro tip jaluzea la o proprietate de la țară" },
  { img: p4, cat: "acoperisuri", title: "Tablă click Canto", alt: "Acoperiș din tablă click gri grafit pe o casă modernă" },
] as const;

const FILTERS: { key: Cat; label: string }[] = [
  { key: "toate", label: "Toate" },
  { key: "garduri", label: "Garduri" },
  { key: "acoperisuri", label: "Acoperișuri" },
];

export function Portfolio() {
  const [cat, setCat] = useState<Cat>("toate");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = PROJECTS.filter((p) => cat === "toate" || p.cat === cat);
  const active = lightbox !== null ? PROJECTS[lightbox] : null;

  return (
    <section id="portofoliu" className="section-pad border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <p className="eyebrow">Portofoliu</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-3xl font-bold uppercase sm:text-5xl">Proiecte finalizate</h2>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCat(f.key)}
                  className={`rounded-sm border px-4 py-2 font-display text-xs uppercase transition-colors ${
                    cat === f.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <motion.button
                key={p.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                onClick={() => setLightbox(PROJECTS.indexOf(p))}
                className="group relative aspect-square overflow-hidden rounded-md border border-border"
              >
                <img
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  width={1000}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                <p className="absolute inset-x-0 bottom-0 p-4 text-left font-display text-sm font-bold uppercase">
                  {p.title}
                </p>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 p-6 backdrop-blur"
          >
            <button
              aria-label="Închide"
              className="absolute top-6 right-6 rounded-sm border border-border p-2"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.figure
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="max-w-3xl"
            >
              <img src={active.img} alt={active.alt} className="rounded-md" />
              <figcaption className="mt-4 text-center font-display uppercase">
                {active.title}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
