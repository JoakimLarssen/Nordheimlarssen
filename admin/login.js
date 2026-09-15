(() => {
  const message = document.querySelector('#login-message');
  const messages = {
    denied: 'Sign-in was not completed. Use the GitHub account with admin access and try again.',
    setup: 'Sign-in is not available yet. Please try again later.',
    expired: 'Your session has expired. Please sign in again.',
    unavailable: 'Sign-in is temporarily unavailable. Please try again shortly.',
  };
  const error = new URLSearchParams(location.search).get('error');
  if (Object.hasOwn(messages, error)) {
    message.textContent = messages[error];
    message.hidden = false;
  }
})();
