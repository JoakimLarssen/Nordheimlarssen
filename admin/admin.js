(() => {
  const grid = document.querySelector('#devices');
  const notice = document.querySelector('#notice');
  const refresh = document.querySelector('#refresh');
  const logout = document.querySelector('#logout');
  let csrf = null;
  let expiryTimer;
  let toastTimer;
  let loading = false;
  let active = true;
  const statusLabels = { registered: 'Adresse klar', planned: 'Planlagt', setup: 'Venter på oppsett', unlinked: 'Ikke koblet til', expired: 'Logg inn igjen', unapproved: 'Må godkjennes', no_address: 'Adresse mangler' };
  const iconPaths = { laptop: 'M4 5h16v12H4z M2 20h20l-2-3H4z', mini: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M17 17h.01', desktop: 'M7 2h10v20H7z M10 6h4 M10 9h4 M12 17h.01' };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(shape) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', iconPaths[shape] || iconPaths.laptop);
    svg.append(path);
    return svg;
  }

  function showNotice(text) {
    notice.textContent = text;
    notice.hidden = !text;
  }

  function showToast(text) {
    const toast = document.querySelector('#toast');
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
  }

  function clearPrivateContent() {
    active = false;
    csrf = null;
    clearTimeout(expiryTimer);
    clearTimeout(toastTimer);
    grid.replaceChildren();
    document.querySelector('#account').textContent = 'Adminkonsoll';
    document.querySelector('#summary').textContent = '';
    document.querySelector('#updated').textContent = '';
    document.querySelector('#toast').hidden = true;
    logout.disabled = true;
    refresh.disabled = true;
  }

  function expire() {
    clearPrivateContent();
    location.replace('/admin/login?error=expired');
  }

  async function api(route, options = {}) {
    const response = await fetch(`/api/admin?route=${route}`, { ...options, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(25000) });
    if (response.status === 401) {
      expire();
      throw new Error('expired');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'unavailable');
    return data;
  }

  function fact(list, label, value, className) {
    const row = element('div');
    row.append(element('dt', '', label), element('dd', className, value));
    list.append(row);
  }

  function formattedDate(value) {
    return value ? new Intl.DateTimeFormat('nb-NO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Ikke oppgitt';
  }

  function card(device) {
    const article = element('article', `device-card${device.planned ? ' planned' : ''}`);
    const top = element('div', 'device-top');
    const title = element('div', 'device-title');
    const symbol = element('div', 'device-icon');
    symbol.append(icon(device.shape));
    const heading = element('div');
    heading.append(element('h2', '', device.name), element('p', '', device.model));
    title.append(symbol, heading);
    const status = element('span', 'status', statusLabels[device.status] || 'Ukjent status');
    status.dataset.state = device.status;
    top.append(title, status);
    article.append(top);
    if (device.planned) {
      const illustration = element('div', 'planned-illustration');
      illustration.append(icon('laptop'));
      article.append(illustration, element('p', 'planned-message', 'En plass er klar til din neste MacBook. Adresse og SSH-kommando vises her når den er koblet til.'));
      return article;
    }
    const facts = element('dl', 'device-facts');
    fact(facts, 'Tailscale-IP', device.address || 'Ikke tilgjengelig', 'address');
    fact(facts, 'SSH-bruker', device.sshUser || 'Ikke satt opp');
    fact(facts, 'Port', String(device.port));
    article.append(facts);
    const commandArea = element('div', 'command-area');
    commandArea.append(element('span', 'command-label', 'SSH-kommando'));
    if (device.command) {
      const row = element('div', 'command-row');
      const command = element('code', '', device.command);
      const copy = element('button', 'copy-button', 'Kopier');
      copy.type = 'button';
      copy.setAttribute('aria-label', `Kopier SSH-kommando for ${device.name}`);
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(device.command);
          if (active) showToast(`SSH-kommandoen for ${device.name} er kopiert.`);
        } catch {
          if (!active) return;
          const range = document.createRange();
          range.selectNodeContents(command);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          showToast('Kommandoen er markert. Bruk Ctrl+C eller ⌘C for å kopiere.');
        }
      });
      row.append(command, copy);
      commandArea.append(row);
    } else {
      const text = device.status === 'expired' ? 'Logg inn på Tailscale igjen på denne maskinen.' : device.status === 'unapproved' ? 'Godkjenn maskinen i Tailscale først.' : device.status === 'registered' ? 'Legg til SSH-brukeren for å få kommandoen.' : 'Kommandoen kommer når maskinen er satt opp.';
      commandArea.append(element('p', 'command-placeholder', text));
    }
    article.append(commandArea);
    const details = element('details', 'device-details');
    details.append(element('summary', '', 'Forbindelsesdetaljer'));
    const connectionFacts = element('dl');
    fact(connectionFacts, 'Operativsystem', device.os);
    fact(connectionFacts, 'Nettverksnavn', device.dnsName || 'Ikke tilgjengelig');
    fact(connectionFacts, 'Sist sett av Tailscale', formattedDate(device.lastSeen));
    for (const address of device.addresses || []) if (address !== device.address) fact(connectionFacts, 'Ekstra IP-adresse', address);
    details.append(connectionFacts, element('p', '', 'En registrert adresse bekrefter ikke at maskinen er våken eller at SSH svarer.'));
    article.append(details);
    return article;
  }

  async function loadDevices(update = false) {
    if (loading) return;
    loading = true;
    refresh.disabled = true;
    refresh.querySelector('span').textContent = 'Henter adresser …';
    grid.setAttribute('aria-busy', 'true');
    grid.querySelectorAll('.copy-button').forEach(button => { button.disabled = true; });
    showNotice('');
    try {
      const data = await api(update ? 'refresh' : 'devices', update ? { method: 'POST', headers: { 'X-CSRF-Token': csrf } } : {});
      if (!active) return;
      grid.replaceChildren(...data.devices.map(card));
      const registered = data.devices.filter(device => device.status === 'registered').length;
      document.querySelector('#summary').textContent = `${registered} med adresse av ${data.devices.filter(device => !device.planned).length} maskiner`;
      document.querySelector('#updated').textContent = data.fetchedAt ? `Oppdatert ${formattedDate(data.fetchedAt)}` : 'Ikke oppdatert ennå';
      document.querySelector('#connection-note').textContent = 'Tailscale må kjøre på begge maskinene. Adressen følger maskinen når du bytter nettverk. Maskinen du kobler til må være våken og ha SSH slått på.';
      if (!data.configured) showNotice('Tailscale er ikke koblet til oversikten ennå. Adressene vises når oppsettet er fullført.');
    } catch (error) {
      if (error.message === 'expired' || !active) return;
      const message = error.message === 'device_config' ? 'Maskinoppsettet må rettes før adressene kan hentes.' : 'Kunne ikke hente adresser. Prøv «Oppdater adresser» igjen om litt.';
      showNotice(grid.children.length ? `${message} Opplysningene nedenfor er fra forrige oppdatering.` : message);
      document.querySelector('#summary').textContent = 'Oppdatering mislyktes';
    } finally {
      loading = false;
      refresh.disabled = !active || !csrf;
      refresh.querySelector('span').textContent = 'Oppdater adresser';
      grid.setAttribute('aria-busy', 'false');
    }
  }

  async function start() {
    active = true;
    try {
      const session = await api('session');
      if (!active) return;
      csrf = session.csrf;
      const account = document.querySelector('#account');
      account.replaceChildren();
      if (typeof session.avatarUrl === 'string' && /^https:\/\/avatars\.githubusercontent\.com\//.test(session.avatarUrl)) {
        const avatar = element('img', 'account-avatar');
        avatar.src = session.avatarUrl;
        avatar.alt = '';
        avatar.width = 28;
        avatar.height = 28;
        avatar.referrerPolicy = 'no-referrer';
        account.append(avatar);
      }
      account.append(element('span', '', `Logget inn som ${session.name || session.login}`));
      logout.disabled = false;
      clearTimeout(expiryTimer);
      expiryTimer = setTimeout(expire, Math.max(0, session.expiresAt - Date.now()));
      await loadDevices();
    } catch (error) {
      if (error.message !== 'expired' && active) showNotice('Kunne ikke kontrollere innloggingen. Last siden på nytt.');
    }
  }

  refresh.addEventListener('click', () => loadDevices(true));
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    try {
      await api('logout', { method: 'POST', headers: { 'X-CSRF-Token': csrf } });
      clearPrivateContent();
      location.replace('/admin/login');
    } catch (error) {
      if (error.message === 'expired' || !active) return;
      logout.disabled = false;
      showNotice('Utloggingen mislyktes. Prøv igjen.');
    }
  });
  window.addEventListener('pagehide', clearPrivateContent);
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  start();
})();
