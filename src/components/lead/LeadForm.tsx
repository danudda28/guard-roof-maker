import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft, Info } from "lucide-react";
import { MetalButton } from "@/components/ui/metal-button";
import { useLead, type ProjectType } from "@/components/lead/LeadContext";

const JUDETE = [
  "Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov","București",
  "Buzău","Călărași","Caraș-Severin","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu",
  "Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt",
  "Prahova","Sălaj","Satu Mare","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vâlcea","Vaslui","Vrancea",
];

type Answers = {
  tip: ProjectType;
  judet: string;
  metri: string;
  structura: string;
  ape: string;
  sarpanta: string;
  urgenta: string;
  nume: string;
  telefon: string;
  email: string;
};

const EMPTY: Answers = {
  tip: null, judet: "", metri: "", structura: "", ape: "", sarpanta: "",
  urgenta: "", nume: "", telefon: "", email: "",
};

function Option({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-sm border px-5 py-4 text-left font-display text-sm uppercase transition-all ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export function LeadForm() {
  const { open, closeForm, initialType } = useLead();
  const [a, setA] = useState<Answers>(EMPTY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setA({ ...EMPTY, tip: initialType });
      setStep(initialType ? 1 : 0);
      setDone(false);
      setDir(1);
    }
  }, [open, initialType]);

  const isGard = a.tip === "gard" || a.tip === "ambele";
  const isRoof = a.tip === "acoperis" || a.tip === "ambele";

  const steps = useMemo(() => {
    const s: string[] = ["tip", "judet"];
    if (isGard) s.push("metri", "structura");
    if (isRoof) s.push("ape", "sarpanta");
    s.push("urgenta", "contact");
    return s;
  }, [isGard, isRoof]);

  const current = steps[Math.min(step, steps.length - 1)]!;
  const progress = done ? 100 : (step / steps.length) * 100;

  const go = (n: number) => {
    setDir(n);
    setStep((s) => Math.max(0, s + n));
  };
  const set = (patch: Partial<Answers>, advance = true) => {
    setA((prev) => ({ ...prev, ...patch }));
    if (advance) setTimeout(() => go(1), 180);
  };

  const submit = () => {
    // TODO: conectare la CRM / webhook / WhatsApp
    console.log("lead", a);
    setDone(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-background/90 p-0 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative flex h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-border bg-card sm:h-auto sm:min-h-[540px] sm:rounded-lg"
          >
            <div className="h-1 w-full bg-secondary">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-primary"
              />
            </div>

            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <button
                onClick={() => go(-1)}
                disabled={step === 0 || done}
                className="flex items-center gap-2 text-xs uppercase text-muted-foreground disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" /> Înapoi
              </button>
              <span className="font-display text-xs uppercase tracking-widest text-primary">
                Consultanță gratuită
              </span>
              <button aria-label="Închide" onClick={closeForm}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto p-6 sm:p-10">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={done ? "done" : current}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -60 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {done ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <svg viewBox="0 0 52 52" className="h-20 w-20">
                        <motion.circle
                          cx="26" cy="26" r="24" fill="none" stroke="#f0c018" strokeWidth="2"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.path
                          d="M14 27l8 8 16-16" fill="none" stroke="#f0c018" strokeWidth="3"
                          strokeLinecap="round" strokeLinejoin="round"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        />
                      </svg>
                      <h3 className="mt-6 font-display text-2xl font-bold uppercase">
                        Perfect, {a.nume || "mulțumim"}!
                      </h3>
                      <p className="mt-3 max-w-md text-muted-foreground">
                        Cineva din echipa Metallic Group te sună în cel mult 24 de ore pentru
                        consultanța gratuită.
                      </p>
                      <div className="mt-8">
                        <MetalButton onClick={closeForm}>Închide</MetalButton>
                      </div>
                    </div>
                  ) : current === "tip" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">Ce te interesează?</h3>
                      <div className="grid gap-3">
                        {(
                          [
                            ["gard", "Gard metalic"],
                            ["acoperis", "Acoperiș metalic"],
                            ["ambele", "Ambele"],
                          ] as const
                        ).map(([v, l]) => (
                          <Option key={v} label={l} selected={a.tip === v} onClick={() => set({ tip: v })} />
                        ))}
                      </div>
                    </>
                  ) : current === "judet" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">Din ce zonă ești?</h3>
                      <select
                        value={a.judet}
                        onChange={(e) => setA({ ...a, judet: e.target.value })}
                        className="w-full rounded-sm border border-border bg-secondary/40 px-4 py-4 text-sm"
                      >
                        <option value="">Alege județul</option>
                        {JUDETE.map((j) => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                      <MetalButton disabled={!a.judet} onClick={() => go(1)}>Continuă</MetalButton>
                    </>
                  ) : current === "metri" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">
                        Câți metri liniari are gardul?
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {["0-50 m", "50-100 m", "100-200 m", "peste 200 m"].map((m) => (
                          <Option key={m} label={m} selected={a.metri === m} onClick={() => set({ metri: m })} />
                        ))}
                      </div>
                    </>
                  ) : current === "structura" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">
                        Gardul este deja construit (structura / stâlpii montați)?
                      </h3>
                      <div className="grid gap-3">
                        {["Da", "Nu", "Parțial"].map((v) => (
                          <Option
                            key={v}
                            label={v}
                            selected={a.structura === v}
                            onClick={() => set({ structura: v }, false)}
                          />
                        ))}
                      </div>
                      {a.structura && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 rounded-sm border border-primary/40 bg-primary/10 p-4 text-sm"
                        >
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <p>
                            Important de știut: noi producem și livrăm gardul, montajul se face prin
                            colaboratorii noștri certificați.
                          </p>
                        </motion.div>
                      )}
                      {a.structura && <MetalButton onClick={() => go(1)}>Continuă</MetalButton>}
                    </>
                  ) : current === "ape" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">
                        În câte ape este acoperișul?
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {["1 apă", "2 ape", "4 ape", "Altă configurație"].map((v) => (
                          <Option key={v} label={v} selected={a.ape === v} onClick={() => set({ ape: v })} />
                        ))}
                      </div>
                    </>
                  ) : current === "sarpanta" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">
                        Aveți deja structura de lemn / șarpanta făcută?
                      </h3>
                      <div className="grid gap-3">
                        {["Da", "Nu", "Nu știu"].map((v) => (
                          <Option key={v} label={v} selected={a.sarpanta === v} onClick={() => set({ sarpanta: v })} />
                        ))}
                      </div>
                    </>
                  ) : current === "urgenta" ? (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">
                        Cât de repede vrei să pornească proiectul?
                      </h3>
                      <div className="grid gap-3">
                        {["În curând (sub 1 lună)", "În 1-3 luni", "Doar mă informez"].map((v) => (
                          <Option key={v} label={v} selected={a.urgenta === v} onClick={() => set({ urgenta: v })} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-display text-2xl font-bold uppercase">Date de contact</h3>
                      <div className="grid gap-4">
                        <input
                          value={a.nume}
                          maxLength={100}
                          onChange={(e) => setA({ ...a, nume: e.target.value })}
                          placeholder="Nume și prenume"
                          className="rounded-sm border border-border bg-secondary/40 px-4 py-4 text-sm"
                        />
                        <input
                          value={a.telefon}
                          maxLength={20}
                          inputMode="tel"
                          onChange={(e) => setA({ ...a, telefon: e.target.value })}
                          placeholder="Telefon"
                          className="rounded-sm border border-border bg-secondary/40 px-4 py-4 text-sm"
                        />
                        <input
                          value={a.email}
                          maxLength={255}
                          onChange={(e) => setA({ ...a, email: e.target.value })}
                          placeholder="Email (opțional)"
                          className="rounded-sm border border-border bg-secondary/40 px-4 py-4 text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Prin trimitere ești de acord cu prelucrarea datelor personale conform
                        Politicii de Confidențialitate și Regulamentului GDPR.
                      </p>
                      <MetalButton
                        disabled={a.nume.trim().length < 2 || a.telefon.trim().length < 9}
                        onClick={submit}
                      >
                        Trimite solicitarea
                      </MetalButton>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
