# Overnight check-in: nordheimlarssen.no redesign

Branch: `redesign/craft-density` (local only, nothing pushed, nothing touched main).
Live site untouched. The `/writing` section untouched.

## What happened tonight

1. **Baseline captured.** Full-page screenshots of the live site, every page, desktop 1440 and iPhone 13:
   `C:\Users\joaki\.shots\nordheim-redesign\baseline\`
   The before shot proves the diagnosis: below the hero, `desktop-home-full.png` is blank black panels because every section hides behind scroll reveals (`.reveal` + IntersectionObserver in `main.js`).

2. **Research round.** Five agents studied the reference sites (peers, craft, restraint, evidence, cautionary) and a sixth built a content dossier from the live site so every fact stays exact. A synthesized design brief drove the drafts.

3. **Three direction mockups, built and iterated across four full cycles.** They live in `mockups/direction-{a,b,c}.html` in this branch. Open them directly in a browser, or look at the latest rendered shots in `C:\Users\joaki\.shots\nordheim-redesign\round4\` (desktop fold, desktop full, mobile full for each; `round1` through `round3` show the evolution).

**Round 3** answered the second fresh-eyes panel's hardest complaint (all three were an 800px column wasting the desktop) by rebuilding all three on full-width grids. **Round 4** embedded product screenshots and cleared the third panel's complaints (hero dead zones, grade colors, a real mobile nav, matching captions). **Round 5** made the decisive evidence call: the fourth critique panel was unanimous that pasted product screenshots were now the weak point, since a terminal capture goes illegible when scaled into a content column, imports its own off-palette colors, and can catch a blocked state. So the Riposte evidence is now a native HTML rendering of the real lab session, typeset in each page's own mono and single accent (accent used only on the prompt glyph, the validated tokens, and the scope-gate denial line). It is legible at every width, on-palette, honest, and more in-spirit than a screenshot. Futtia dropped the self-contradictory illustration and is presented text-first with its link, like the thesis. A copy audit found the writing unusually clean (zero AI vocabulary, zero em dashes, every fact matching the live site); the only fixes were killing "at the intersection of" and tightening one blurb.

## The three directions (pick one, or mix)

**A. DOSSIER** (austere end) `mockups/direction-a.html`
A typeset engineer's dossier. Dark, zero JavaScript, IBM Plex Mono structure with prose set in IBM Plex Sans for readability. One green accent. The signature: the `~/jnl` tree recast as an annotated table of contents with quantified proof per section (2 products in development, 3 podium finishes and 1 win, 7 pieces of writing), plus one deliberate typographic moment: "1st" at Cybvest in display size mid-page. Fastest, quietest, most Filippo/Dan Luu.

**B. EVIDENCE CONSOLE** (crafted middle) `mockups/direction-b.html`
Dense operator-grade monochrome with one amber accent rationed to evidence. The fold lands name, identity, NOW/NEXT/OPEN, and a credential strip of four evidence cells (3 podium finishes / Riposte + Futtia / MSc NTNU Gjovik / thesis A). Owned numbered section headings (01 About .. 06 Contact) with row counts, one consistent metadata anatomy, TUI-style row highlighting, and the signature interaction: a working ctrl+K command palette with a visible keycap affordance. A fresh-eyes comparative critic ranked this fold #1 for five-second credibility.

**C. MACHINE** (lively end) `mockups/direction-c.html`
The hero is a real terminal session: static transcript on load (whoami, cat now.txt), fully typeable with JS (help, riposte, ctf, ssh easter egg and more; every output is verified fact). Below it a dated shipped-log pointing into canonical sections, then the full content, each item stated exactly once. Teal accent, subtle phosphor texture on the terminal chrome only.

All three: every section rendered on load (full-page screenshots show content top to bottom), zero console errors, no horizontal overflow at 390px, zero em dashes, facts byte-checked against the live site, Google Fonts the only external request.

## What the adversarial critics said (the honest part)

Three zero-context critics and a comparative judge reviewed round 1 from screenshots only. Their unanimous headline: the content reads serious, but the full terminal-cosplay stack (fake bash chrome, $ prompts everywhere, path-style headers, winking meta-copy) is the most cloned portfolio genre on the internet and caps how senior you look. Round 2 responded by stripping trope stacking and giving each direction its own metaphor (document / evidence console / machine) while keeping the terminal-brand credibility you locked. A second fresh-eyes critique round is running now; results and fixes will be in the next commits.

## Decisions I need from you

1. **Pick a direction** (A, B, or C), or name a mix (for example B's structure with A's tree as the index). The full-site build (case-study pages for Riposte and Futtia with real product visuals, writing integration, about, contact, 404, OG images) starts the moment you pick.
2. **"I ship products" vs `[ in dev ]`**: the hero verb and the project badges undercut each other (a critic caught it in five seconds). Options: soften the verb ("build products"), or badge differently. Your call; I did not touch the claim.
3. **Oslo vs Bergen adjacency**: "Security researcher and developer, Oslo" sits near "Hoyskolen Kristiania, Bergen campus" and reads like a contradiction to a stranger even though both are true. Round 2 rewords the annotations to make the relationship obvious; flag if you want it stated differently.
4. **How much terminal idiom to keep at all**: the critics would go further than your locked direction allows (one suggested a light "typeset dossier" variant with no terminal vocabulary). I stayed inside your lock; say the word if you want to see that fourth variant as a rendered mockup.

## Futtia evidence (a flag, not a blocker)

Your only real Futtia app screenshot is a weak empty-state (it even shows a "Good morning, Joakimnordheimlarssen" name-concatenation bug), so the exhibit currently uses the dark labelled-pitch view from futtia.no. It looks far better on the dark page and keeps its own "ILLUSTRATION" tag so it stays honest, but it is a marketing illustration, not a real logged analysis. If you would rather show a genuine analysis, we need to capture one from the running product during the build round. Riposte's exhibit, by contrast, is a real session on a lab target and needs nothing.

## Status note

The subagent fleet briefly hit the monthly spend limit around 02:16 and paused a round mid-flight; capacity returned and the paused workflow resumed from cache with nothing lost. Every checkpoint builds and the branch is healthy.

## Where this stands

Five full build/critique/gate cycles in, all three directions are at a "would a top studio ship this" bar: differentiated by metaphor (document / evidence console / machine), evidence-backed by a real Riposte session, rule-clean, and verified at desktop and mobile. The honest next step is your pick. I will keep running lighter verification passes until you choose a direction, then build that one out to the full multi-page site (case-study pages, 404, OG images, favicon check, a real Futtia capture if you want one).

Latest renders: `C:\Users\joaki\.shots\nordheim-redesign\round5\`.
