/* Run in the head, before paint; storage is optional. */
(() => {
  let saved;
  try { saved = localStorage.getItem('jnl-theme'); } catch {}
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : dark ? 'dark' : 'light';
})();
