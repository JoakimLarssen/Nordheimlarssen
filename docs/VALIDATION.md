# Validation: personal site revamp

7 September 2026. Seven rebuilt pages were checked using local Chromium, with HTML/CSS/JavaScript inlined via Playwright `set_content`.

## Executed

- **56 page/viewport/theme combinations:** seven pages × 320, 390, 768 and 1440 CSS-pixel viewports × light and dark themes. No horizontal document overflow, no uncaught script errors, visible main headings and the expected initial theme.
- Static structure: one H1 per page, unique IDs, language, title/description/canonical metadata, skip links, local link destinations, and `noopener` on new-tab links.
- Portfolio: initial state, Software / Research / All filters, pressed states, live result count, and a hash change that reveals a filtered-out project.
- Theme: both toggle directions, accessible button label/state, and browser theme-color metadata.
- Reduced motion: zero transition duration in the emulated reduced-motion context.
- Progressive enhancement: all seven pages retain their headings and navigation with JavaScript disabled. All projects remain visible and unusable filter controls remain hidden.
- Native education disclosure, keyboard focus target, email fallback when Clipboard API is unavailable, and text/background token contrast of at least 4.5:1 for the tested palette combinations.

**449 assertions passed; zero failed.** Repeated assertions are narrow checks, not 449 independent test scenarios. See `tools/qa_site.py` for the test implementation.

Screenshots were rendered for desktop home, dark home, mobile home, desktop/mobile portfolio, About, Writing and CTF. Home and mobile portfolio were visually inspected; a missing space at the mobile football line break was fixed before the final render.

## Limits

This environment blocks external downloads and HTTP browser navigation. The checks do **not** establish production HTTP behavior, deployment success, real network performance or asset delivery. Legacy article/PDF/image destinations were checked against the repository inventory; their bytes and browser rendering were not part of the local test suite.

Safari, Firefox, assistive-technology testing, full WCAG conformance, Lighthouse and axe were not run. Clipboard permission success and persistent storage/cross-tab behavior were not exercised on a secure origin. Contrast checks cover the defined text/background tokens, not every possible composited pixel.

The styles applied to existing essays/CV need a real-site regression pass, including print. Existing external links should be checked in the deployment preview.

## Running the optional checks

The website itself has no Python or Playwright dependency. For local development checks only:

```sh
python3 -m pip install playwright beautifulsoup4
python3 -m playwright install chromium
python3 tools/qa_site.py
```

The script uses a system Chromium when available, otherwise Playwright's bundled Chromium. Results are written to a temporary directory unless `QA_OUTPUT` is set. No tests send requests to external sites.
