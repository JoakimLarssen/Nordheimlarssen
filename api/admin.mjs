import { readFile } from 'node:fs/promises';
import { beginLogin, configuration, createAuth, finishLogin, getSession, logout, sameValue } from '../lib/admin-auth.mjs';
import { DeviceError, getDevices } from '../lib/admin-devices.mjs';

const views = {
  login: new URL('../lib/views/admin-login.html', import.meta.url),
  dashboard: new URL('../lib/views/admin.html', import.meta.url),
};

function json(response, status, data) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

function redirect(response, location) {
  response.statusCode = 303;
  response.setHeader('Location', location);
  response.end();
}

async function page(response, name) {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(await readFile(views[name]));
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  let route;
  try {
    const config = configuration();
    const url = new URL(request.url, config.origin);
    route = url.searchParams.get('route') || 'page';
    const methods = { page: 'GET', 'login-page': 'GET', login: 'GET', callback: 'GET', session: 'GET', devices: 'GET', refresh: 'POST', logout: 'POST' };
    if (!Object.hasOwn(methods, route)) return json(response, 404, { error: 'not_found' });
    if (request.method !== methods[route]) {
      response.setHeader('Allow', methods[route]);
      return json(response, 405, { error: 'method_not_allowed' });
    }
    const auth = createAuth(request, response, config);
    if (route === 'login') {
      if (!config.ready) return redirect(response, '/admin/login?error=setup');
      return redirect(response, await beginLogin(auth, config));
    }
    if (route === 'callback') {
      if (!config.ready) return redirect(response, '/admin/login?error=setup');
      if (!await finishLogin(auth, url, config)) return redirect(response, '/admin/login?error=denied');
      return redirect(response, '/admin');
    }
    const session = await getSession(auth, config);
    if (route === 'login-page') return session ? redirect(response, '/admin') : await page(response, 'login');
    if (route === 'page') return session ? await page(response, 'dashboard') : redirect(response, '/admin/login');
    if (!session) return json(response, 401, { error: 'unauthorized' });
    if (request.method === 'POST' && (request.headers.origin !== config.origin || !sameValue(request.headers['x-csrf-token'], session.csrf))) return json(response, 403, { error: 'forbidden' });
    if (route === 'session') return json(response, 200, { login: session.login, name: session.name, avatarUrl: session.avatarUrl, csrf: session.csrf, expiresAt: session.exp * 1000 });
    if (route === 'devices' || route === 'refresh') return json(response, 200, await getDevices(auth.client, { refresh: route === 'refresh' }));
    if (route === 'logout') {
      await logout(auth, session);
      return json(response, 200, { ok: true });
    }
  } catch (error) {
    if (route === 'callback') return redirect(response, '/admin/login?error=unavailable');
    return json(response, 503, { error: error instanceof DeviceError ? error.code : 'unavailable' });
  }
}
