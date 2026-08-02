import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LeadProvider, useLead } from "@/components/lead/LeadContext";
import { LeadForm } from "@/components/lead/LeadForm";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { FenceAssembly } from "@/components/sections/FenceAssembly";
import { Products } from "@/components/sections/Products";
import { Process } from "@/components/sections/Process";
import { About } from "@/components/sections/About";
import { Portfolio } from "@/components/sections/Portfolio";
import { Testimonials } from "@/components/sections/Testimonials";
import { Footer } from "@/components/sections/Footer";
import { MetalButton } from "@/components/ui/metal-button";

const TITLE = "Garduri metalice și țiglă metalică | Metallic Group";
const DESC =
  "Soluțiile moderne de la Metallic Group pentru un cămin confortabil și protejat. Garduri metalice, țiglă metalică și tablă click — consultanță, transport și montaj.";

export const Route = createFileRoute("/")({
  component: () => (
    <LeadProvider>
      <Page />
    </LeadProvider>
  ),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Metallic Group",
          description: DESC,
          telephone: "+40731954719",
          email: "office@metallicgroup.ro",
          url: "https://metallicgroup.ro",
          areaServed: "România",
          address: [
            {
              "@type": "PostalAddress",
              streetAddress: "Șoseaua Alexandriei 236",
              addressLocality: "București",
              addressCountry: "RO",
            },
            {
              "@type": "PostalAddress",
              streetAddress: "Strada Aurel Vlaicu 135",
              addressLocality: "Constanța",
              addressCountry: "RO",
            },
          ],
        }),
      },
    ],
  }),
});

function StickyCta() {
  const { openForm, open } = useLead();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && !open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-4 bottom-4 z-40 sm:right-6 sm:left-auto"
        >
          <MetalButton size="lg" className="w-full sm:w-auto" onClick={() => openForm()}>
            Ia Consultanță Gratuită
          </MetalButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <FenceAssembly />
        <Products />
        <Process />
        <About />
        <Portfolio />
        <Testimonials />
      </main>
      <Footer />
      <StickyCta />
      <LeadForm />
    </div>
  );
}
