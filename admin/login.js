(() => {
  const message = document.querySelector('#login-message');
  const button = document.querySelector('#login-button');
  const params = new URLSearchParams(location.search);
  const messages = {
    denied: 'Innloggingen ble ikke fullført. Bruk GitHub-kontoen som har tilgang, og prøv igjen.',
    setup: 'Innloggingen er ikke satt opp ennå. Administrator må fullføre oppsettet før siden kan brukes.',
    expired: 'Økten er utløpt. Logg inn igjen for å fortsette.',
    unavailable: 'Innloggingen er midlertidig utilgjengelig. Prøv igjen om litt.',
  };
  if (messages[params.get('error')]) {
    message.textContent = messages[params.get('error')];
    message.hidden = false;
  }
  let popup;
  let timer;
  let deadline;
  let checking = false;
  let waiting = false;
  function stop(text) {
    waiting = false;
    clearTimeout(timer);
    button.textContent = 'Logg inn med GitHub';
    message.textContent = text;
    message.hidden = false;
  }
  async function checkSession() {
    if (!waiting || checking) return;
    if (Date.now() > deadline) return stop('Innloggingen tok for lang tid. Prøv igjen.');
    checking = true;
    try {
      const response = await fetch('/api/admin?route=session', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (response.ok && waiting) {
        waiting = false;
        popup?.close();
        location.replace('/admin');
        return;
      }
    } catch {}
    finally {
      checking = false;
      clearTimeout(timer);
      if (waiting) timer = setTimeout(checkSession, 2000);
    }
  }
  function complete(result) {
    if (!waiting || result?.type !== 'github-login-result') return;
    if (messages[result.error]) return stop(messages[result.error]);
    checkSession();
  }
  window.addEventListener('message', event => {
    if (event.origin === location.origin && event.source === popup) complete(event.data);
  });
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('admin-github-login');
    channel.onmessage = event => complete(event.data);
  }
  button.addEventListener('click', () => {
    if (waiting && popup && !popup.closed) return popup.focus();
    popup = window.open('/api/admin?route=login', 'nordheim-github-login', 'popup,width=560,height=720');
    if (!popup) return stop('Tillat sprettoppvinduer for å logge inn med GitHub, og prøv igjen.');
    waiting = true;
    deadline = Date.now() + 10 * 60 * 1000;
    button.textContent = 'Åpne GitHub igjen';
    message.textContent = 'Fullfør innloggingen i GitHub-vinduet.';
    message.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(checkSession, 1500);
  });
  window.addEventListener('pagehide', () => { waiting = false; clearTimeout(timer); });
})();
