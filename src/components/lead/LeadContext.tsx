import { createContext, useContext, useState, type ReactNode } from "react";

export type ProjectType = "gard" | "acoperis" | "ambele" | null;

type LeadCtx = {
  open: boolean;
  initialType: ProjectType;
  openForm: (type?: ProjectType) => void;
  closeForm: () => void;
};

const Ctx = createContext<LeadCtx | null>(null);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<ProjectType>(null);

  return (
    <Ctx.Provider
      value={{
        open,
        initialType,
        openForm: (type = null) => {
          setInitialType(type);
          setOpen(true);
        },
        closeForm: () => setOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLead() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLead must be used inside LeadProvider");
  return ctx;
}
