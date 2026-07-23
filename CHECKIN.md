# Check-in: nordheimlarssen.no redesign

Branch: `redesign/craft-density` (local only, nothing pushed to main, so nordheimlarssen.no is unchanged until you approve a merge).

## Headline: the full site is now built in the dossier direction

You picked A. It is now the real site on this branch, cohesive end to end:
- **Home** (`index.html`): the dossier, self-contained, zero JavaScript, replacing the old scroll-reveal page.
- **`/cv`** (`cv/index.html`): a styled dark CV that prints to a clean light PDF via a Download PDF button; every privacy and honesty rule enforced.
- **`/writing`**: the hub and all six essays restyled into the same dossier system by rewriting only the shared `styles.css`/`main.js`, so all published prose is byte-identical and the scroll-reveals are gone.

Everything is committed and verified at desktop, mobile, and (for the CV) print. Latest full-site shots: `C:\Users\joaki\.shots\nordheim-redesign\` (`home/`, `cv/`, `writing-after/`).

## Still in flight (polish round)

Unifying the nav across all pages so `/cv` is reachable everywhere, a dossier 404, a refreshed OG/social image, a favicon check, and a final full-site adversarial pass across home, `/cv`, and `/writing` together.

---

## How it got here (the record)

## What happened tonight

1. **Baseline captured.** Full-page screenshots of the live site, every page, desktop 1440 and iPhone 13:
   `C:\Users\joaki\.shots\nordheim-redesign\baseline\`
   The before shot proves the diagnosis: below the hero, `desktop-home-full.png` is blank black panels because every section hides behind scroll reveals (`.reveal` + IntersectionObserver in `main.js`).

2. **Research round.** Five agents studied the reference sites (peers, craft, restraint, evidence, cautionary) and a sixth built a content dossier from the live site so every fact stays exact. A synthesized design brief drove the drafts.

3. **Three direction mockups, built and iterated across four full cycles.** They live in `mockups/direction-{a,b,c}.html` in this branch. Open them directly in a browser, or look at the latest rendered shots in `C:\Users\joaki\.shots\nordheim-redesign\round4\` (desktop fold, desktop full, mobile full for each; `round1` through `round3` show the evolution).

**Round 3** answered the second fresh-eyes panel's hardest complaint (all three were an 800px column wasting the desktop) by rebuilding all three on full-width grids. **Round 4** embedded product screenshots and cleared the third panel's complaints (hero dead zones, grade colors, a real mobile nav, matching captions). **Round 5** made the decisive evidence call: the fourth critique panel was unanimous that pasted product screenshots were now the weak point, since a terminal capture goes illegible when scaled into a content column, imports its own off-palette colors, and can catch a blocked state. So the Riposte evidence is now a native HTML rendering of the real lab session, typeset in each page's own mono and single accent (accent used only on the prompt glyph, the validated tokens, and the scope-gate denial line). It is legible at every width, on-palette, honest, and more in-spirit than a screenshot. Futtia dropped the self-contradictory illustration and is presented text-first with its link, like the thesis. A copy audit found the writing unusually clean (zero AI vocabulary, zero em dashes, every fact matching the live site); the only fixes were killing "at the intersection of" and tightening one blurb.

## DECISION MADE: Direction A (Dossier)

You picked **A, the dossier**, with CV skills grouped into categories. That locks the direction and starts the real build. The other two directions stay in `mockups/` as a record. Below is the description of all three for reference; A is the one being built out.

## The three directions

**A. DOSSIER** (austere end) `mockups/direction-a.html`
A typeset engineer's dossier. Dark, zero JavaScript, IBM Plex Mono structure with prose set in IBM Plex Sans for readability. One green accent. The signature: the `~/jnl` tree recast as an annotated table of contents with quantified proof per section (2 products in development, 3 podium finishes and 1 win, 7 pieces of writing), plus one deliberate typographic moment: "1st" at Cybvest in display size mid-page. Fastest, quietest, most Filippo/Dan Luu.

**B. EVIDENCE CONSOLE** (crafted middle) `mockups/direction-b.html`
Dense operator-grade monochrome with one amber accent rationed to evidence. The fold lands name, identity, NOW/NEXT/OPEN, and a credential strip of four evidence cells (3 podium finishes / Riposte + Futtia / MSc NTNU Gjovik / thesis A). Owned numbered section headings (01 About .. 06 Contact) with row counts, one consistent metadata anatomy, TUI-style row highlighting, and the signature interaction: a working ctrl+K command palette with a visible keycap affordance. A fresh-eyes comparative critic ranked this fold #1 for five-second credibility.

**C. MACHINE** (lively end) `mockups/direction-c.html`
The hero is a real terminal session: static transcript on load (whoami, cat now.txt), fully typeable with JS (help, riposte, ctf, ssh easter egg and more; every output is verified fact). Below it a dated shipped-log pointing into canonical sections, then the full content, each item stated exactly once. Teal accent, subtle phosphor texture on the terminal chrome only.

All three: every section rendered on load (full-page screenshots show content top to bottom), zero console errors, no horizontal overflow at 390px, zero em dashes, facts byte-checked against the live site, Google Fonts the only external request.

## What the adversarial critics said (the honest part)

Three zero-context critics and a comparative judge reviewed round 1 from screenshots only. Their unanimous headline: the content reads serious, but the full terminal-cosplay stack (fake bash chrome, $ prompts everywhere, path-style headers, winking meta-copy) is the most cloned portfolio genre on the internet and caps how senior you look. Round 2 responded by stripping trope stacking and giving each direction its own metaphor (document / evidence console / machine) while keeping the terminal-brand credibility you locked. A second fresh-eyes critique round is running now; results and fixes will be in the next commits.

## In progress now

- **/cv page** built into A's dossier system at `cv/index.html`: a styled dark CV that prints to a clean light PDF via a Download PDF button (print-optimized `@media print`, no separate PDF file to go stale). All your privacy and honesty rules enforced: references reduced to "Available on request" (the six phone numbers are gone), no address or birthdate, only the site's own contact reused, Riposte shown as co-built with Krister Eriksen, Cybvest CTF co-host stated as once, no forensics, no Cyberlandslaget placement, Hoyskolen with the o-slash. Skills grouped Languages / Security / Tools with nothing added. Cybvest association Leader and Kvarteret volunteer developer included; earlier work kept compact.

## Small open questions (not blocking)

1. **"I ship products" vs `[ in dev ]`**: the home hero verb and the project badges slightly undercut each other. Soften to "build products", or badge differently? Your call; I have not touched the claim.
2. **CV standfirst wording**: you specified "Security engineer and builder, Oslo" for the CV, while the home says "Security researcher and developer, Oslo". Both are true; flag if you want them unified.

## Next stages (A is locked, so these begin next)

Promote A to the real home (`index.html` plus a shared stylesheet), integrate the existing `/writing` section cleanly, then a 404 that looks intentional, OG/social image, and a favicon check. A real Futtia analysis capture is optional polish if you want a product screenshot rather than the honest pipeline diagram now in place.

## Status note

The subagent fleet briefly hit the monthly spend limit around 02:16 and paused a round mid-flight; capacity returned and the paused workflow resumed from cache with nothing lost. Every checkpoint builds and the branch is healthy.

## Where this stands

Five full build/critique/gate cycles in, all three directions are at a "would a top studio ship this" bar: differentiated by metaphor (document / evidence console / machine), evidence-backed by a real Riposte session, rule-clean, and verified at desktop and mobile. The honest next step is your pick. I will keep running lighter verification passes until you choose a direction, then build that one out to the full multi-page site (case-study pages, 404, OG images, favicon check, a real Futtia capture if you want one).

Latest renders: `C:\Users\joaki\.shots\nordheim-redesign\round5\`.
