(() => {
  const error = new URLSearchParams(location.search).get('error');
  const result = { type: 'github-login-result', error: ['setup', 'denied', 'unavailable'].includes(error) ? error : null };
  document.querySelector('#result-title').textContent = result.error ? 'Innloggingen ble ikke fullført' : 'Du er logget inn';
  if (window.opener) window.opener.postMessage(result, location.origin);
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('admin-github-login');
    channel.postMessage(result);
    channel.close();
  }
  window.close();
})();
