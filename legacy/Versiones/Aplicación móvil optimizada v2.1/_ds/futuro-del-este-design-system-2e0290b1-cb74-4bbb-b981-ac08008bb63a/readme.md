# Futuro del Este — Design System

Brand & UI design system for **Fundación Futuro del Este**, a nonprofit foundation
based in the East of Uruguay (Maldonado / Punta del Este region) working at the
intersection of **sustainability and accessibility**. The system captures the visual
and verbal identity of the foundation's current website and Instagram so that future
products — starting with a planned **mobile app** — stay on-brand.

> Tagline: **Sustentabilidad + Accesibilidad**
> Mission: *"Queremos contribuir a generar un cambio cultural que permita incorporar,
> de forma orgánica, conceptos de sustentabilidad y accesibilidad en todos los proyectos."*

## Sources
This system was distilled from material the client provided. Keep these for reference
(the reader may not have access):
- **Website:** https://www.futurodeleste.org (Inicio, Quiénes somos, Qué hacemos, Contactanos, Novedades, Colaborá)
- **Instagram:** https://www.instagram.com/futurodeleste/
- **Uploaded assets:** `uploads/logo.png` (wave mark), `uploads/heroWebFDE.png` (homepage hero photo), `uploads/ig.png` (Instagram grid reference)
- Also linked from the site: LinkedIn (`/company/futuro-del-este`), Facebook, X, WhatsApp, a YouTube institutional video.

The current website is built on Google Sites, so it has no proprietary design tokens
or component code — this system is reconstructed from the live visuals + brand assets.

---

## Content fundamentals
**Language:** Rioplatense Spanish (Uruguay). Uses the *voseo* — "Sumate", "Colaborá",
"Conocé", "Contactanos" — never "Súmate/Colabora" (tú/imperative-Spain forms).

**Voice:** warm, inclusive, collective and hopeful. The foundation speaks as **"nosotros"**
("Queremos contribuir…", "Buscamos naturalizar…", "Brindamos experiencias…") and addresses
the reader directly and informally ("vos"). It is mission-driven and plain-spoken — not
corporate, not academic, never preachy.

**Recurring vocabulary:** sustentabilidad, accesibilidad, inclusión, discapacidad,
cuidado ambiental, cambio cultural, naturalizar, concientizar, en alianza, comunidad, el Este.

**Casing:** Headlines in sentence case or ALL CAPS for posters/wordmark. The "+" in
*Sustentabilidad + Accesibilidad* is a signature — keep the spaces around it.

**Tone examples:**
- CTA: "Colaborá", "Sumate al cambio", "Confirmá tu asistencia", "Ver todas las novedades".
- Body: "En alianza con diversas instituciones locales, nacionales e internacionales,
  brindamos experiencias para ayudar a concientizar e incorporar aprendizajes sobre
  inclusión y sustentabilidad."
- Poster: "ENTRADA GRATUITA", "48° ANIVERSARIO", "DÍA MUNDIAL DEL MEDIO AMBIENTE".

**Emoji:** not part of the formal brand on the website. Instagram occasionally uses a
few. In product UI keep them minimal and functional (the app kit uses a couple as
lightweight wayfinding icons — replace with a real icon set for production; see Iconography).

---

## Visual foundations
**Core motif — the wave.** The identity is an **ocean wave**: the logo is a circle
filled with layered, overlapping wavy bands running from teal-green at the top to deep
ocean blue at the bottom, divided by thin white lines. This "del Este / coastal" wave
recurs as section dividers, gradients and card accents. (`WaveDivider` component,
`--gradient-wave`.)

**Color.** A cool blue-green ramp pulled straight from the logo:
emerald `#01B8A4` → aqua `#1DC9C9` → cyan `#019AC4` → blue `#0397CD` → ocean `#01608F`,
anchored by a deep **navy ink** `#133B5C` for the wordmark and headings.
Cyan `#019AC4` is the primary interactive color; emerald is the secondary. Neutrals are
cool/blue-leaning (paper `#F4F8FA`, slate text). No warm grays, no black backgrounds
except the app-icon ring. See `tokens/colors.css`.

**Typography.** (See font caveat below.)
- **Display** — *Oswald*, condensed uppercase. Used for poster numerals, eyebrows and
  big Instagram headlines ("48°", "DÍA MUNDIAL…"). Letter-spacing 0.02–0.14em.
- **UI / body** — *Mulish*, a friendly humanist sans. Extrabold (800) for headings,
  regular/medium for text. Tight tracking on headings (−0.01em).
- **Accent** — *Lora italic*, a transitional serif used for poster captions, pull
  quotes and testimonials ("*Celebramos sus 48 años…*").

**Backgrounds.** Three families: (1) clean cool-white surfaces; (2) full-bleed
**photography** of community activities with a soft light or deep-navy wash; (3) solid
brand color / the wave gradient for posters and hero bands. No noise, no grain, no
heavy texture. Photography is warm-natural, candid, people-centered, outdoors.

**Shape & radius.** Soft and round. Buttons are **pills** (`--radius-pill`); cards use
large radii (`--radius-lg` 20px and up); social cards go to 40px+. Nothing sharp-cornered.

**Shadows.** Soft, low-contrast, cool-tinted (`rgba(17,37,50,…)`). A `--shadow-brand`
cyan glow lifts primary buttons. No hard or black drop shadows.

**Borders.** Hairline `1px` in `--border-subtle` (`#D5E1E7`) on cards; `1.5px` on inputs;
focus state is a `2px` cyan border + soft cyan ring (`--ring-focus`).

**Motion.** Calm and gentle — fades and small lifts, standard ease
(`cubic-bezier(0.4,0,0.2,1)`), 140–400ms. **No bounce, no spring.** Accessibility-first:
motion is subtle and never required to understand content.

**States.** Hover shifts to a darker shade of the same hue (never opacity-dim) and cards
lift `−3px`. Press scales to `0.97`. Disabled is 50% opacity. Selected chips get a cyan
border + tinted fill.

**Layout.** Airy and breathable, generous white space around the mark. Centered hero
lockups; content maxes at `1200px` (`--container-max`); 8px-based spacing.

---

## Iconography
The current website (Google Sites) ships **no custom icon set** — it uses Google's
default social glyphs and a chevron. There is therefore no proprietary icon font to copy.

**Guidance for product work:**
- The one true brand asset is the **wave mark** (`assets/logo-mark.png`, also embedded in
  the `Logo` component). Treat it as the hero glyph; never recolor or distort it.
- For UI icons, use an **outline icon set with rounded caps/joins** to match the soft,
  round brand geometry — e.g. **Lucide** or **Phosphor (regular)** from CDN. This is a
  **substitution** (the brand has no icon library of its own) — flagged for the client.
- Emoji appear as placeholder wayfinding in the app UI kit only; swap for the chosen
  icon set before production.
- The decorative wave (`WaveDivider`) is brand furniture, not an icon — use it for
  section breaks and hero caps.

---

## ⚠️ Caveats / substitutions (please confirm)
- **Fonts are nearest-match substitutions.** The real brand fonts aren't publicly
  distributed; we mapped them to Google Fonts: **Oswald** (display), **Mulish** (UI/body),
  **Lora** (italic accent). If you have the actual brand fonts, send the files and we'll
  swap them in `tokens/fonts.css`.
- **Colors** were sampled from the logo PNG and brand imagery — accurate but not from an
  official spec. Confirm exact hex values if a brand book exists.
- **The mobile app kit is a concept**, designed from the brand (the app doesn't exist
  yet). It demonstrates how the identity translates to product — treat it as a starting
  direction, not a spec.

---

## Index / manifest
**Foundations**
- `styles.css` — global entry point (consumers link this one file; `@import`s only)
- `tokens/fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `base.css`

**Components** (`window.FuturoDelEsteDesignSystem_<hash>`)
- `components/core/` — `Button`, `Badge`, `Card`
- `components/forms/` — `Input`
- `components/brand/` — `Logo`, `WaveDivider`

**UI kits**
- `ui_kits/website/` — homepage recreation (Nav, Hero, Mission, News, Footer)
- `ui_kits/app/` — concept mobile app (Home, Event, Colaborá, Perfil + phone shell)

**Templates / social**
- `social/` — Instagram post templates (evento, efeméride, cita/aniversario)

**Specimen cards** (Design System tab)
- `guidelines/` — color, type, spacing & brand foundation cards

**Assets**
- `assets/logo-mark.png` · `assets/hero-web.png` · `assets/reference-instagram.png`

**Other**
- `SKILL.md` — portable Agent-Skill manifest
