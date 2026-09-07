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
  const clock = document.getElementById('local-time');
  const age = document.getElementById('age');
  const birthday = { year: 2004, month: 12, day: 21 };
  const dateFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', year: 'numeric', month: 'numeric', day: 'numeric' });
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  function updateClock() {
    const now = new Date();
    clock.textContent = formatter.format(now);
    clock.dateTime = now.toISOString();
    const date = Object.fromEntries(dateFormatter.formatToParts(now).map(part => [part.type, part.value]));
    const beforeBirthday = Number(date.month) < birthday.month || (Number(date.month) === birthday.month && Number(date.day) < birthday.day);
    age.textContent = String(Number(date.year) - birthday.year - Number(beforeBirthday));
  }
  updateClock();
  setInterval(updateClock, 1000);
  document.getElementById('year').textContent = String(new Date().getFullYear());
  document.querySelectorAll('.post-slideshow').forEach(gallery => {
    const slides = [...gallery.querySelectorAll('.post-slide')];
    const controls = gallery.querySelector('.slide-controls');
    const position = gallery.querySelector('.slide-position');
    const play = gallery.querySelector('.slideshow-play');
    const thumbnails = [...gallery.querySelectorAll('[data-index]')];
    let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    function move(step) {
      slides[current].hidden = true;
      current = (current + step + slides.length) % slides.length;
      slides[current].hidden = false;
      position.textContent = `${current + 1} / ${slides.length}`;
      thumbnails.forEach((button, index) => button.setAttribute('aria-pressed', String(index === current)));
    }
    function updatePlayback() {
      play.textContent = playing ? 'Pause' : 'Play';
      play.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      position.setAttribute('aria-live', playing ? 'off' : 'polite');
    }
    function navigate(step) {
      playing = false;
      updatePlayback();
      move(step);
    }
    updatePlayback();
    play.addEventListener('click', () => { playing = !playing; updatePlayback(); });
    setInterval(() => {
      if (playing && !document.hidden && !gallery.matches(':hover') && !gallery.contains(document.activeElement)) move(1);
    }, 5000);
    controls.hidden = false;
    controls.querySelectorAll('[data-slide]').forEach(button => {
      button.addEventListener('click', () => navigate(Number(button.dataset.slide)));
    });
    thumbnails.forEach(button => button.addEventListener('click', () => navigate(Number(button.dataset.index) - current)));
    gallery.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
    });
    let touchStart;
    gallery.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', event => {
      if (touchStart === undefined) return;
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 50) navigate(distance < 0 ? 1 : -1);
      touchStart = undefined;
    }, { passive: true });
  });
})();
