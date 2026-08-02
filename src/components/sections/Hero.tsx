import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-gard.jpg";
import { MetalButton } from "@/components/ui/metal-button";
import { useLead } from "@/components/lead/LeadContext";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { openForm } = useLead();

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Gard metalic modern antracit montat în fața unei case contemporane"
          width={1920}
          height={1088}
          className="h-[118%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/70" />
      </motion.div>

      <div className="mx-auto w-full max-w-7xl px-5 pt-28 pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow"
        >
          Soluțiile moderne de la Metallic Group
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-4xl text-4xl leading-[1.02] font-bold uppercase sm:text-6xl lg:text-7xl"
        >
          Garduri și acoperișuri metalice
          <span className="block text-gold">făcute să reziste</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          Producem garduri metalice, țiglă metalică și tablă click pentru case din toată România.
          Peste 14 ani de experiență, 20.000 de proiecte finalizate și consultanță gratuită înainte
          de orice decizie.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <MetalButton size="lg" onClick={() => openForm()}>
            Ia Consultanță Gratuită
          </MetalButton>
          <a href="#produse">
            <MetalButton size="lg" variant="ghost">
              Vezi produsele
            </MetalButton>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/60 pt-6 font-display text-sm text-muted-foreground uppercase"
        >
          <span>14+ ani experiență</span>
          <span>20.000+ proiecte</span>
          <span>Transport inclus</span>
          <span>Plată în rate</span>
        </motion.div>
      </div>

      <motion.a
        href="#asamblare"
        style={{ opacity: fade }}
        className="absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase"
      >
        Scroll
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-primary" />
        </motion.span>
      </motion.a>
    </section>
  );
}
