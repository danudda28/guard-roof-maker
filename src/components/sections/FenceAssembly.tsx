import { useEffect, useRef, useState, type ComponentType, type MutableRefObject } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";

type SceneProps = { progressRef: MutableRefObject<number> };

export function FenceAssembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  useEffect(() => {
    let alive = true;
    void import("./FenceScene3D").then((mod) => {
      if (alive) setScene(() => mod.default);
    });
    return () => {
      alive = false;
    };
  }, []);

  const introOpacity = useTransform(scrollYProgress, [0, 0.05, 0.12], [1, 1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.84, 0.92], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.84, 0.92], [30, 0]);
  const barScale = scrollYProgress;

  return (
    <section id="asamblare" ref={sectionRef} className="relative h-[420vh] bg-[#12161e]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {Scene ? (
          <Scene progressRef={progressRef} />
        ) : (
          <div className="absolute inset-0 bg-[#12161e]" />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-[#12161e]/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#12161e]/90 to-transparent" />

        <motion.div
          style={{ opacity: introOpacity }}
          className="absolute top-24 right-0 left-0 z-20 px-5 text-center"
        >
          <p className="eyebrow">Precizie milimetrică</p>
          <h2 className="mt-3 text-2xl font-bold uppercase sm:text-4xl">
            Gardul care se asamblează
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Scroll — gardul real MX 60 DUO se asamblează în 3D, piesă cu piesă.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: captionOpacity, y: captionY }}
          className="pointer-events-none absolute inset-x-0 bottom-16 z-20 px-6 text-center"
        >
          <p className="font-display text-xl font-bold uppercase sm:text-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Fiecare gard, montat cu <span className="text-gold">precizie milimetrică</span>
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Model real MX 60 DUO — lamele tip jaluzea din producția Metallic Group.
          </p>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 z-20 h-px w-44 -translate-x-1/2 overflow-hidden bg-border">
          <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-primary" />
        </div>
      </div>
    </section>
  );
}
