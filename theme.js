(() => {
  try {
    document.documentElement.dataset.theme = localStorage.getItem('jnl-theme') === 'light' ? 'light' : 'dark';
  } catch {}
})();
