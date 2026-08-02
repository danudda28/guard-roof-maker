import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "gold" | "ghost";
  size?: "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

type Ripple = { id: number; x: number; y: number };

export function MetalButton({
  children,
  onClick,
  variant = "gold",
  size = "md",
  className,
  type = "button",
  disabled,
}: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={{ y: -2 }}
      whileTap={{ y: 1, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 650);
        onClick?.();
      }}
      className={cn(
        "relative isolate overflow-hidden rounded-sm font-display font-bold uppercase tracking-wider transition-colors disabled:opacity-50",
        size === "lg" ? "px-8 py-4 text-sm md:text-base" : "px-5 py-3 text-xs md:text-sm",
        variant === "gold"
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)] hover:brightness-110"
          : "border border-border bg-secondary/60 text-foreground backdrop-blur hover:border-primary/60 hover:text-primary",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ opacity: 0.5, scale: 0 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{ left: r.x, top: r.y }}
          className="pointer-events-none absolute -ml-12 -mt-12 h-24 w-24 rounded-full bg-foreground/40"
        />
      ))}
    </motion.button>
  );
}
