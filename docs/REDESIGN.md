# Personal site revamp

Prepared 7 September 2026. Based on `JoakimLarssen/Nordheimlarssen` at commit `e378098d0f09e968d598cab4f4c3cb1062a5b408`.

## Direction

A personal homepage and a separate work gallery. The homepage should introduce Joakim, not sell a consultancy or imitate a terminal. Projects, writing, study, CTFs, football and the everyday setup share the page, but not equal visual weight.

The design uses an ivory canvas, charcoal typography, terracotta links, and a small set of sage, lavender and blue surfaces. A restrained serif accent adds character without making the whole site look like a publication. Dark mode follows the same hierarchy. Project covers are original HTML/CSS compositions, not copied reference-site artwork.

## Reference comparison

References were reviewed through their public page content on 7 September 2026. This is a content/structure comparison and design interpretation, not a measured performance audit or pixel-level reconstruction of those sites.

| Reference | Useful idea | Trade-off | Decision |
| --- | --- | --- | --- |
| [Ana: home](https://ana.sh/) and [portfolio](https://ana.sh/portfolio) | A personality-rich personal home separate from a gallery of work. Facts, interests and tools belong alongside professional work. The portfolio gives each project real visual room. | Importing every status, music, weather or fitness widget would create maintenance work and copy another person's interests. | Main structural reference. Keep Joakim's actual interests, use an honest local clock, and do not fabricate live integrations. |
| [Paco Coursey](https://paco.me/) | Short introduction, selective project links, writing and a personal Now section. | A purely text-led version would underplay the visual, personal direction the user requested. | Borrow concise copy and restraint, not an entirely text-only homepage. |
| [Brittany Chiang](https://brittanychiang.com/) | About, experience, projects, writing and an easy-to-find resume create a clear professional path. | A resume-first home would let academic and professional detail crowd out personality. | Keep the CV and education easy to find, but give detailed credentials a separate home. |
| [Rauno Freiberg](https://rauno.me/) | A compact introduction and focused entrances into craft, projects and notes. | A craft-showcase treatment is not a substitute for showing the user's own work and interests. | Borrow focused navigation and careful interaction details; avoid spectacle and scroll-dependent content. |

## Audit of the previous site

The existing content is useful. The problem is its hierarchy and presentation rather than a lack of facts.

- The three-column dashboard gives screenshots, simulated social posts, projects, setup and education competing emphasis. The personal introduction is confined to a narrow sidebar.
- The homepage is trying to be a personal page, project directory, social feed, CV and writing index at once. Detailed material needs its own pages, with selective previews on the home.
- Project entries are small text cards. A dedicated portfolio gives each project a cover, an explanation, a contribution/role and a destination.
- White LinkedIn-styled posts within a dark/purple page introduce a separate visual language. The new About page retains the updates and original links, but presents them as part of this site.
- The repository already has multiple visual generations: `home.css`, `styles.css`, inline CV styles and a `theme.css` bridge. Existing long-form documents should not be rewritten merely to change their look.

## Pages and preserved material

- `/`: personal introduction, dated current activity, Riposte and Futtia, NTNU, Quorra, Rosenborg, writing, setup and fun facts.
- `/portfolio`: Riposte, Futtia and SAIF, with progressively enhanced All / Software / Research filters.
- `/about`: biography, fun facts, education and selected grades, original social-update links and contact.
- `/writing`: a focused reading index, with the thesis highlighted.
- `/ctf`: distinct student/overall rankings and links to the original first-blood images and scoreboard.
- `/uses`: the original public hardware/software inventory.
- `/404.html`: a matching error page with useful navigation.

Existing essays, the CV document, PDF downloads, image files, robots configuration and Vercel configuration remain in place. Existing home anchors `whoami`, `projects`, `ctf`, `academics`, `setup`, `about`, `contact` and `top` remain usable. The old `home.css` and `home.js` are left in the repository, but rebuilt pages use `site.css` and `site.js`.

`theme.css` refreshes the screen presentation of legacy essays and the CV; their content and print rules are not replaced. These legacy pages have not been fully browser-regression-tested in this environment.

## Content integrity

Copy is based on the repository and public personal site, not inferred professional achievements. Project status remains **in development**. Project stacks are explicitly the publicly listed stacks, not an audit of current product code.

The Riposte and Futtia images are labelled illustrated project covers, not product screenshots. The SAIF artwork is labelled an editorial cover treatment, not the original thesis cover. Original PDF links remain available.

NNS CTF's fourth place and six first bloods are labelled as student-division results, not overall results. The Mac mini chip is not invented. The setup and current-activity copy are dated snapshots, not live feeds. Personal photographs, customer logos, endorsements, usage metrics, uptime and music activity have not been fabricated.

## Implementation

The production site remains static HTML/CSS/JavaScript. No framework migration, package manager, build service, analytics or API credentials are required. Rebuilt pages use system fonts and local styles/scripts. Older essays retain their existing dependencies.

All navigation and reading content work without JavaScript. JavaScript adds theme selection, an Oslo clock, age/year updates, an optional clipboard button and project filtering. Storage and clipboard failure have fallbacks. Reduced-motion users do not get animated transitions. Tables retain native headings, links have visible keyboard focus, and the primary pages have skip links.

Preview a checkout using `python3 -m http.server 8000` from the repository root. Visit `http://localhost:8000/`. Directory URLs such as `/portfolio/` work with the standard static server.

## Validation and review before merge

The accompanying `VALIDATION.md` records the actual checks and limitations. No Lighthouse score, WCAG certification or live deployment success is claimed.

Review the home and portfolio on a real mobile device; check the existing essays and CV in both themes and in print; open the original PDFs and CTF images; verify the current project descriptions/stacks; and check the deployment preview's redirects, canonical URLs, HTTP status codes and share image before merging.

The current `og.png` is intentionally retained. A fresh social-sharing image and real product screenshots are useful future additions, not placeholders masquerading as finished assets.
