import { Phone, Mail, MapPin } from "lucide-react";
import { MetalButton } from "@/components/ui/metal-button";
import { useLead } from "@/components/lead/LeadContext";
import { SITE } from "@/lib/site";

export function Footer() {
  const { openForm } = useLead();

  return (
    <footer id="contact" className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-border pb-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-bold uppercase sm:text-4xl">Gata de schimbare?</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Transformați casa într-un cămin confortabil și protejat cu produsele noastre de
              calitate. Cere o consultanță gratuită.
            </p>
          </div>
          <MetalButton size="lg" onClick={() => openForm()}>
            Ia Consultanță Gratuită
          </MetalButton>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-3">
          <div>
            <span className="font-display text-lg font-bold">
              METALLIC<span className="text-primary">GROUP</span>
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              Furnizor de soluții moderne pentru garduri metalice, țiglă metalică și tablă click.
              Peste 14 ani de experiență și 20.000 de proiecte finalizate.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={SITE.phoneHref} className="flex items-center gap-2 hover:text-primary">
                <Phone className="h-4 w-4 text-primary" /> {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-4 w-4 text-primary" /> {SITE.email}
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-primary">
              Puncte de lucru
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {SITE.locations.map((l) => (
                <li key={l.city} className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-foreground">{l.city}</strong> — {l.address}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-primary">
              Link-uri rapide
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#produse" className="hover:text-primary">Produse</a></li>
              <li><a href="#proces" className="hover:text-primary">Cum lucrăm</a></li>
              <li><a href="#despre" className="hover:text-primary">De ce Metallic Group</a></li>
              <li><a href="#portofoliu" className="hover:text-primary">Portofoliu</a></li>
              <li><a href={SITE.app} className="hover:text-primary">Cere ofertă online</a></li>
              <li><a href={SITE.tiktok} className="hover:text-primary">TikTok</a></li>
              <li><a href={SITE.cel} className="hover:text-primary">Magazin CEL.ro</a></li>
            </ul>
          </div>
        </div>

        <p className="border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Metallic Group. Toate drepturile rezervate. Imaginile și
          descrierile au caracter informativ; caracteristicile finale sunt cele din oferta și
          contractul agreat de părți.
        </p>
      </div>
    </footer>
  );
}
