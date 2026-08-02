import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const POSTS = [70, 350, 630, 910];
const BAYS: Array<[number, number]> = [
  [POSTS[0]!, POSTS[1]!],
  [POSTS[1]!, POSTS[2]!],
  [POSTS[2]!, POSTS[3]!],
];
const SLATS_PER_BAY = 7;

function Piece({
  progress,
  from,
  to,
  x,
  y,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  x?: number;
  y?: number;
  children: React.ReactNode;
}) {
  const opacity = useTransform(progress, [from, from + (to - from) * 0.35, to], [0, 1, 1]);
  const tx = useTransform(progress, [from, to], [x ?? 0, 0]);
  const ty = useTransform(progress, [from, to], [y ?? 0, 0]);

  return (
    <motion.g style={{ opacity, x: tx, y: ty }}>
      {children}
    </motion.g>
  );
}

export function FenceAssembly() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const glow = useTransform(scrollYProgress, [0.82, 0.88, 0.95], [0, 1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.86, 0.93], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.86, 0.93], [24, 0]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.2], [1, 1, 0]);
  const barScale = scrollYProgress;

  return (
    <section id="asamblare" ref={ref} className="relative h-[360vh] bg-background">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(90deg,#fff_0,#fff_1px,transparent_1px,transparent_4px)]" />

        <motion.div style={{ opacity: introOpacity }} className="absolute top-24 px-5 text-center">
          <p className="eyebrow">Precizie milimetrică</p>
          <h2 className="mt-3 text-2xl font-bold uppercase sm:text-4xl">
            Gardul care se asamblează
          </h2>
        </motion.div>

        <div className="w-full max-w-6xl px-4">
          <svg viewBox="0 0 1000 420" className="w-full" aria-hidden="true">
            <defs>
              <linearGradient id="mg-post" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2a2d33" />
                <stop offset="45%" stopColor="#5c6169" />
                <stop offset="100%" stopColor="#20232a" />
              </linearGradient>
              <linearGradient id="mg-slat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#565b63" />
                <stop offset="55%" stopColor="#33373d" />
                <stop offset="100%" stopColor="#22252a" />
              </linearGradient>
            </defs>

            {/* sol */}
            <rect x="0" y="392" width="1000" height="3" fill="#3a3d43" />

            {/* stâlpi */}
            {POSTS.map((x, i) => (
              <Piece
                key={`post-${x}`}
                progress={scrollYProgress}
                from={0.05 + i * 0.05}
                to={0.14 + i * 0.05}
                y={260}
              >
                <rect x={x} y={40} width="26" height="352" rx="2" fill="url(#mg-post)" />
                <rect x={x} y={40} width="26" height="8" rx="2" fill="#6f757e" />
              </Piece>
            ))}

            {/* traverse */}
            {BAYS.map(([x0, x1], b) =>
              [90, 360].map((y, j) => (
                <Piece
                  key={`rail-${b}-${y}`}
                  progress={scrollYProgress}
                  from={0.3 + b * 0.03 + j * 0.015}
                  to={0.4 + b * 0.03 + j * 0.015}
                  x={j % 2 === 0 ? -320 : 320}
                >
                  <rect
                    x={x0 + 20}
                    y={y}
                    width={x1 - x0 - 14}
                    height="10"
                    rx="2"
                    fill="#4a4f57"
                  />
                </Piece>
              )),
            )}

            {/* lamele */}
            {BAYS.map(([x0, x1], b) =>
              Array.from({ length: SLATS_PER_BAY }).map((_, s) => {
                const step = 0.012;
                const start = 0.46 + (b * SLATS_PER_BAY + s) * step;
                return (
                  <Piece
                    key={`slat-${b}-${s}`}
                    progress={scrollYProgress}
                    from={start}
                    to={start + 0.05}
                    y={-120}
                  >
                    <rect
                      x={x0 + 22}
                      y={106 + s * 36}
                      width={x1 - x0 - 18}
                      height="26"
                      rx="2"
                      fill="url(#mg-slat)"
                    />
                  </Piece>
                );
              }),
            )}

            {/* flash de îmbinare */}
            {POSTS.slice(0, 3).map((x, i) => (
              <motion.g key={`weld-${x}`} style={{ opacity: glow }}>
                <circle cx={x + 26} cy={95} r="16" fill="#f0c018" opacity="0.35" />
                <circle cx={x + 26} cy={365} r="16" fill="#f0c018" opacity="0.35" />
                <circle cx={POSTS[i + 1]!} cy={95} r="10" fill="#fff3c4" opacity="0.6" />
              </motion.g>
            ))}
          </svg>
        </div>

        <motion.div
          style={{ opacity: captionOpacity, y: captionY }}
          className="absolute bottom-24 px-6 text-center"
        >
          <p className="font-display text-xl font-bold uppercase sm:text-3xl">
            Fiecare gard, montat cu <span className="text-gold">precizie milimetrică</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Stâlpi, traverse și lamele produse în aceeași fabrică — se potrivesc din prima.
          </p>
        </motion.div>

        <div className="absolute bottom-8 h-px w-40 overflow-hidden bg-border">
          <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-primary" />
        </div>
      </div>
    </section>
  );
}
