import { useEffect, useRef, useState, type ComponentType, type MutableRefObject } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Hand, X, ZoomIn } from "lucide-react";

type SceneProps = { progressRef: MutableRefObject<number>; interactive?: boolean };

export function FenceAssembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [playing, setPlaying] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    setCanPlay(v > 0.93);
    if (v < 0.9) setPlaying(false);
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

  const barScale = scrollYProgress;

  return (
    <section id="asamblare" ref={sectionRef} className="relative h-[420vh] bg-black">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {Scene ? (
          <Scene progressRef={progressRef} interactive={playing} />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-[#12161e]/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#12161e]/90 to-transparent" />

        <AnimatePresence>
          {canPlay && !playing ? (
            <motion.button
              key="play-hint"
              type="button"
              onClick={() => setPlaying(true)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="absolute inset-x-0 top-1/2 z-30 mx-auto flex w-max -translate-y-1/2 items-center gap-3 rounded-full border border-primary/40 bg-black/70 px-5 py-3 text-sm font-medium backdrop-blur-sm transition hover:border-primary hover:bg-black/85"
            >
              <motion.span
                animate={{ rotate: [-12, 12, -12], y: [0, -3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="text-primary"
              >
                <Hand className="h-5 w-5" />
              </motion.span>
              Atinge modelul — rotește-l și dă zoom
            </motion.button>
          ) : null}

          {playing ? (
            <motion.div
              key="play-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-24 z-30 flex justify-center px-4"
            >
              <div className="flex items-center gap-3 rounded-full border border-border bg-black/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <Hand className="h-4 w-4 text-primary" /> trage pentru rotire
                </span>
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="h-4 w-4 text-primary" /> scroll / pinch pentru zoom
                </span>
                <button
                  type="button"
                  onClick={() => setPlaying(false)}
                  className="ml-1 flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Ieși
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>


        <div className="absolute bottom-8 left-1/2 z-20 h-px w-44 -translate-x-1/2 overflow-hidden bg-border">
          <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-primary" />
        </div>
      </div>
    </section>
  );
}
