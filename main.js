/* ==========================================================================
   nordheimlarssen.no  ::  main.js
   Restrained, meaningful motion only:
     - reveal elements + draw-in hairline rules on scroll (IntersectionObserver)
     - single caret on the active nav item (scroll-spy)
     - status dot pulses once when the hero enters view
   Respects prefers-reduced-motion. No deps, no build step.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Current year in the footer */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Reveal on scroll (and draw-in rules / one-shot pulse) ---- */
  var revealTargets = document.querySelectorAll(".reveal, .section-head, .now-line");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // No motion: show everything immediately.
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Scroll-spy: single caret marks the active nav item ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[data-nav]"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      linkFor[id] = a;
    });

    var sections = navLinks
      .map(function (a) { return document.getElementById(a.getAttribute("href").replace("#", "")); })
      .filter(Boolean);

    var setActive = function (id) {
      navLinks.forEach(function (a) { a.classList.remove("is-active"); });
      if (linkFor[id]) {
        linkFor[id].classList.add("is-active");
        linkFor[id].setAttribute("aria-current", "true");
        navLinks.forEach(function (a) {
          if (a !== linkFor[id]) a.removeAttribute("aria-current");
        });
      }
    };

    var spy = new IntersectionObserver(function (entries) {
      // Pick the entry nearest the top that is intersecting.
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }
})();
