/* Progressive enhancement: navigation and content never depend on JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    toggles.forEach(button => {
      button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
      button.setAttribute('aria-pressed', String(dark));
      button.hidden = false;
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#181a18' : '#f7f7f2';
  }
  syncTheme();
  toggles.forEach(button => button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('jnl-theme', root.dataset.theme); } catch {}
    syncTheme();
  }));
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', event => {
    let saved;
    try { saved = localStorage.getItem('jnl-theme'); } catch {}
    if (saved !== 'light' && saved !== 'dark') {
      root.dataset.theme = event.matches ? 'dark' : 'light';
      syncTheme();
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'jnl-theme') return;
    root.dataset.theme = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : media.matches ? 'dark' : 'light';
    syncTheme();
  });
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', hour12: false });
  function updateClock() {
    const now = new Date();
    document.querySelectorAll('[data-clock]').forEach(clock => { clock.textContent = formatter.format(now); clock.dateTime = now.toISOString(); });
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(now.getFullYear()); });
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Oslo',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now).map(p => [p.type,p.value]));
    const before = Number(parts.month) < 12 || (Number(parts.month) === 12 && Number(parts.day) < 21);
    document.querySelectorAll('[data-age]').forEach(el => { el.textContent = String(Number(parts.year) - 2004 - Number(before)); });
  }
  updateClock();
  setInterval(() => { if (!document.hidden) updateClock(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClock(); });
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    if (!navigator.clipboard || !window.isSecureContext) return;
    button.hidden = false;
    button.addEventListener('click', async () => {
      const status = document.getElementById(button.getAttribute('aria-describedby'));
      try {
        await navigator.clipboard.writeText('joakimnordheimlarssen@gmail.com');
        if (status) status.textContent = 'Email address copied.';
      } catch {
        if (status) status.textContent = 'Copy was blocked. Select the address or use the email link.';
      }
    });
  });
  const filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    const buttons = [...filterBar.querySelectorAll('[data-filter]')];
    const cases = [...document.querySelectorAll('[data-category]')];
    const count = document.querySelector('[data-filter-count]');
    const applyFilter = value => {
      cases.forEach(project => { project.hidden = value !== 'all' && project.dataset.category !== value; });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
      const visible = cases.filter(project => !project.hidden).length;
      if (count) count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    };
    filterBar.hidden = false;
    buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
    window.addEventListener('hashchange', () => {
      const target = cases.find(project => `#${project.id}` === window.location.hash);
      if (target && target.hidden) { applyFilter('all'); target.scrollIntoView(); }
    });
  }
})();
