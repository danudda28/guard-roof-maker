# Metallic Brilliance

PROMPT LOVABLE — Metallic Group (redesign complet)

Notă: site-ul original (metallicgroup.ro) e randat JS-heavy și n-am putut extrage automat textele/pozele exacte de pe el. Prompt-ul de mai jos e construit ca schelet complet, cu placeholder-e clar marcate [ÎNLOCUIEȘTE: ...] acolo unde trebuie să bagi tu textele reale, pozele voastre și poza CEO-ului. Lovable poate genera tot ce ține de cod/design/animații; conținutul real (poze, nume, cifre) trebuie introdus de tine ca să nu inventăm date despre companie.

PROMPT (copiază tot de aici în jos în Lovable)

Vreau să construiești un website modern, premium, cu animații smechere, pentru Metallic Group, producător român de garduri metalice și țiglă metalică. Site-ul trebuie să fie rapid, mobile-first, cu senzație de brand industrial-premium (metal, precizie, soliditate), nu un site generic de firmă de construcții.

1. Stack & bază tehnică

React + Tailwind CSS + Framer Motion pentru animații.

Scroll-driven animations (folosește useScroll + useTransform din Framer Motion, sau GSAP + ScrollTrigger dacă e mai simplu de gestionat).

Design responsive, testat mobil (multe leaduri vin de pe telefon).

Performanță: lazy-load la imagini, animații optimizate (nu bloca scroll-ul pe mobil).

2. Direcție vizuală

Paletă: negru/antracit + gri metalic + un accent de culoare (roșu-oxid, verde industrial, sau albastru-oțel — alege una și fii consecvent).

Tipografie: un font sans-serif bold, industrial, pentru titluri (ex. Space Grotesk, Sora, sau Archivo) + un font neutru pentru text (Inter).

Texturi subtile de metal periat / striații în background-uri, fără să încarce pagina.

Multe micro-interacțiuni: hover pe carduri, butoane cu efect de "apăsare metalică", parallax ușor pe imagini hero.

3. Structura paginilor/secțiunilor

A. Hero (Home)

Titlu puternic tip: "Garduri și acoperișuri metalice făcute să reziste [X] ani" (înlocuiește X cu garanția reală).

Subtitlu scurt: ce faceți, pentru cine, ce vă diferențiază.

CTA principal, vizibil, sticky pe scroll: "Ia Consultanță Gratuită" (buton cu accent color, hover animat).

Video sau imagine hero de fundal cu un gard/acoperiș real de-al vostru [ÎNLOCUIEȘTE: poza/video hero].

Un indicator de scroll animat ("scroll down") care sugerează utilizatorului că urmează ceva cool.

B. Secțiunea "Gardul care se asamblează" (piesa de rezistență — asta vrei tu "super tare")

Pe măsură ce utilizatorul face scroll prin această secțiune (sticky/pinned section, ~300-400vh de scroll "consumat"), un gard metalic de-al vostru se asamblează bucată cu bucată pe ecran:

Stâlpii apar primii, unul câte unul, alunecând din partea de jos în sus cu un mic "thud"/bounce la final.

Traversele orizontale glisează din lateral și se prind între stâlpi.

Panourile/lamelele de gard cad sau glisează și se fixează una câte una, secvențial, sincronizat cu procentul de scroll.

La final, când gardul e complet asamblat, apare un scurt "flash" de lumină pe îmbinări (simulează sudura/fixarea) + un text overlay: "Fiecare gard, montat cu precizie milimetrică" (sau alt text al vostru).

Tehnic: fă asta cu SVG-uri sau elemente PNG cu transparență pentru fiecare piesă de gard (stâlp, traversă, panou), poziționate absolut, iar opacity + translateY/translateX + rotate controlate de progresul de scroll (scrollYProgress din Framer Motion, mapat pe range-uri diferite per piesă, ca să se asambleze secvențial și nu toate deodată).

Adaugă un sticky top-0 h-[100vh] pe container cât timp durează animația, ca userul să "stea" în secțiune în timp ce asamblarea se întâmplă.

[ÎNLOCUIEȘTE: pozele reale ale unui gard de-al vostru, decupate pe piese — stâlp, traversă, panou — sau dă-mi o poză completă de gard și tai eu piesele/SVG-urile din ea].

C. Secțiunea Produse

Două carduri mari, unul pentru Garduri metalice, unul pentru Țiglă metalică, fiecare cu:

Imagine reprezentativă [ÎNLOCUIEȘTE: poze produse reale].

Listă scurtă de beneficii (rezistență, garanție, culori RAL disponibile, durata de viață etc. — [ÎNLOCUIEȘTE cu cifrele voastre reale]).

Hover cu ușoară "ridicare" 3D a cardului (tilt pe mouse move).

CTA propriu: "Vreau ofertă pentru gard" / "Vreau ofertă pentru acoperiș" — ambele duc spre același formular de calificare (secțiunea F), dar pre-completează tipul de proiect.

D. Secțiunea "Cum lucrăm" (proces)

Un stepper orizontal (sau vertical pe mobil) animat la scroll, cu pașii voștri reali de la consultanță până la livrare/montaj prin colaboratori.

Exemplu de pași (ajustează la fluxul vostru real):

Consultanță gratuită & măsurători

Ofertă personalizată

Producție

Livrare / montaj prin echipă parteneră certificată

Fiecare pas apare cu fade-in + slide la intrarea în viewport.

E. Secțiunea "Despre noi" / Echipă

Poza + scurtă descriere pentru CEO. [ÎNLOCUIEȘTE: poza reală a CEO-ului vostru și textul biografic real — nu pot prelua eu automat poza/textul de pe metallicgroup.ro pentru că site-ul e randat prin JavaScript și nu mi-a livrat conținutul; cel mai simplu e să faci tu un screenshot al secțiunii sau să-mi dai poza direct].

Layout tip "carte de vizită premium": poză cu ramă subțire metalică, animație de fade-in + light reflection la hover (un gradient care "trece" peste poză, ca o reflexie pe metal).

Câteva cifre cheie animate (counter-up la scroll): ani de experiență, proiecte finalizate, metri liniari de gard produși, clienți mulțumiți — [ÎNLOCUIEȘTE cu cifrele reale].

F. Secțiunea Portofoliu / Galerie

Grid de proiecte reale, cu filtrare (Toate / Garduri / Acoperișuri).

Click pe o poză deschide un lightbox cu galerie de proiect (before/after dacă aveți).

[ÎNLOCUIEȘTE: pozele reale de proiecte].

G. Formular de calificare lead (CTA central — apare din Hero, din carduri de produse, din footer, ca popup/secțiune dedicată) Formular multi-step (tip typeform, un pas pe ecran, cu progress bar sus), NU un formular clasic lung. Pașii:

Ce te interesează? → Gard metalic / Acoperiș metalic / Ambele

Din ce zonă ești? → input oraș/județ (sau dropdown cu județe din România)

Dacă a ales Gard:

"Câți metri liniari are gardul?" → input numeric sau slider (0-50m, 50-100m, 100-200m, peste 200m)

"Gardul este deja construit (structura/stâlpii montați)?" → Da / Nu / Parțial

Dacă răspunde relevant, afișează un mesaj: "Important de știut: noi producem și livrăm gardul, montajul se face prin colaboratorii noștri certificați." — ca să calificăm corect leadul de la început.

Dacă a ales Acoperiș:

"În câte ape este acoperișul?" → 1 apă / 2 ape / 4 ape / Altă configurație

"Aveți deja structura de lemn/șarpanta făcută?" → Da / Nu / Nu știu

Cât de repede vrei să pornească proiectul? → În curând (sub 1 lună) / În 1-3 luni / Doar mă informez

Date de contact → Nume, Telefon, (opțional) Email

Ecran final de confirmare: "Perfect, [Nume]! Cineva din echipa Metallic Group te sună în cel mult [X ore] pentru consultanța gratuită." + iconiță de check animată (bifă care se desenează, tip SVG path animation).

Fiecare pas are tranziție animată (slide left/right) la Next/Back.

Buton CTA din tot site-ul: "Ia Consultanță Gratuită" — deschide direct acest formular (fie ca modal, fie scroll la secțiune, alege ce merge mai bine în Lovable).

H. Testimoniale

Carusel/slider cu recenzii reale de clienți [ÎNLOCUIEȘTE: recenzii reale, eventual din Google Business].

Auto-scroll cu pauză la hover.

I. Footer

Date de contact, program, link-uri rapide către secțiuni, CTA încă o dată: "Ia Consultanță Gratuită".

Iconițe social media, harta zonei de acoperire dacă aveți.

4. Detalii de animație generale (aplică peste tot, cu măsură)

Fade-in + slight translateY(20px) la intrarea fiecărei secțiuni în viewport (Intersection Observer / whileInView din Framer Motion).

Butoanele CTA au un micro-bounce la hover și un efect de "ripple" metalic la click.

Numerele (statistici) se animă counter-up când intră în viewport.

Nav bar-ul devine solid/blur cu shadow la scroll (transparent peste hero, solid după).

Nu exagera cu animațiile — fiecare trebuie să aibă un scop (să ghideze atenția), nu doar să miște lucruri.

5. SEO & tehnic

Meta title/description optimizate pe "garduri metalice" + "țiglă metalică" + orașul/zona principală de operare.

Schema markup pentru LocalBusiness.

Toate imaginile cu alt-text descriptiv.

Formular conectat (sau pregătit să fie conectat) la un webhook/CRM — spune-mi dacă vrei să-l leg de WhatsApp sau de un CRM și îți fac și partea asta separat.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://guard-roof-maker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/70211a83-ddde-4c96-a677-ad391d4db3ed).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
