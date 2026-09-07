(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  let theme = 'dark';
  try { theme = localStorage.getItem('jnl-theme') === 'light' ? 'light' : 'dark'; } catch {}
  function applyTheme() {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }
  applyTheme();
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    try { localStorage.setItem('jnl-theme', theme); } catch {}
  });
  const clock = document.getElementById('oslo-time');
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  function updateClock() {
    const now = new Date();
    clock.textContent = formatter.format(now);
    clock.dateTime = now.toISOString();
  }
  updateClock();
  setInterval(updateClock, 1000);
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
