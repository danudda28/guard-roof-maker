import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone } from "lucide-react";
import { MetalButton } from "@/components/ui/metal-button";
import { useLead } from "@/components/lead/LeadContext";
import { SITE } from "@/lib/site";

const links = [
  { label: "Produse", href: "#produse" },
  { label: "Cum lucrăm", href: "#proces" },
  { label: "Despre noi", href: "#despre" },
  { label: "Portofoliu", href: "#portofoliu" },
  { label: "Recenzii", href: "#recenzii" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const { openForm } = useLead();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-border/70 bg-background/85 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center gap-3">
          <img
            src="/images/metallic-logo.png"
            alt="Metallic Group"
            className="h-9 w-auto object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight">
            METALLIC<span className="text-primary">GROUP</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:text-foreground hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={SITE.phoneHref}
            className="hidden items-center gap-2 text-sm text-muted-foreground hover:text-primary md:flex"
          >
            <Phone className="h-4 w-4" />
            {SITE.phone}
          </a>
          <div className="hidden sm:block">
            <MetalButton onClick={() => openForm()}>Ia Consultanță Gratuită</MetalButton>
          </div>
          <button
            aria-label="Meniu"
            className="rounded-sm border border-border p-2 lg:hidden"
            onClick={() => setOpenMenu((o) => !o)}
          >
            {openMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openMenu && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpenMenu(false)}
                  className="border-b border-border/50 py-3 font-display text-sm uppercase tracking-wide"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-4">
                <MetalButton
                  className="w-full"
                  onClick={() => {
                    setOpenMenu(false);
                    openForm();
                  }}
                >
                  Ia Consultanță Gratuită
                </MetalButton>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
