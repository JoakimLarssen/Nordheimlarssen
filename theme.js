/* Run in the head, before paint; storage is optional. */
(() => {
  let saved;
  try { saved = localStorage.getItem('jnl-theme'); } catch {}
  document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';
})();
