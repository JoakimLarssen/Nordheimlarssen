/* ==========================================================================
   nordheimlarssen.no/writing  ::  main.js
   Deliberately almost nothing. All content is fully visible on load with zero
   JavaScript. There are no viewport observers, no reveal-on-view effects, and
   no motion tied to page position. The dossier is static top to bottom.

   The one progressive, position-independent enhancement is stamping the
   current year into the footer. If this file never runs, the hardcoded year
   still shows.
   ========================================================================== */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
