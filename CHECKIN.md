# Overnight check-in: nordheimlarssen.no redesign

Branch: `redesign/craft-density` (local only, nothing pushed, nothing touched main).
Live site untouched. The `/writing` section untouched.

## What happened tonight

1. **Baseline captured.** Full-page screenshots of the live site, every page, desktop 1440 and iPhone 13:
   `C:\Users\joaki\.shots\nordheim-redesign\baseline\`
   The before shot proves the diagnosis: below the hero, `desktop-home-full.png` is blank black panels because every section hides behind scroll reveals (`.reveal` + IntersectionObserver in `main.js`).

2. **Research round.** Five agents studied the reference sites (peers, craft, restraint, evidence, cautionary) and a sixth built a content dossier from the live site so every fact stays exact. A synthesized design brief drove the drafts.

3. **Three direction mockups, built and iterated three rounds.** They live in `mockups/direction-{a,b,c}.html` in this branch. Open them directly in a browser, or look at the rendered shots in `C:\Users\joaki\.shots\nordheim-redesign\round2\` (desktop fold, desktop full, mobile full for each).

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

## Next (already in flight, no waiting on you)

Fresh-eyes critique round 2, then fixes, then another render-verify cycle. Repeat until you wake up and pick.
