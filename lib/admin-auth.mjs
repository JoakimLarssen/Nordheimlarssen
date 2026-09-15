import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SESSION_SECONDS = 8 * 60 * 60;

export function configuration() {
  const origin = new URL(process.env.ADMIN_ORIGIN || 'https://www.nordheimlarssen.no');
  const local = !process.env.VERCEL && origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname);
  if ((!local && origin.protocol !== 'https:') || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid admin origin');
  const config = {
    origin: origin.origin, secure: !local,
    secret: process.env.ADMIN_SESSION_SECRET || '',
    githubId: process.env.ADMIN_GITHUB_ID || '',
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    databaseKey: process.env.SUPABASE_SECRET_KEY || '',
  };
  config.ready = config.secret.length >= 43 && /^\d+$/.test(config.githubId) && Boolean(config.clientId && config.clientSecret) && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.supabaseUrl) && config.databaseKey.startsWith('sb_secret_');
  return config;
}

export function sameValue(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function randomToken() { return randomBytes(32).toString('base64url'); }
function name(kind, config) { return `${config.secure ? '__Host-' : ''}nl_${kind}`; }
function hashToken(token, config) { return createHash('sha256').update(`${config.origin}\n${token}`).digest('hex'); }
function signature(payload, config) { return createHmac('sha256', config.secret).update(payload).digest('base64url'); }

function sealTransaction(value, config) {
  const payload = Buffer.from(JSON.stringify({ ...value, origin: config.origin, purpose: 'github-oauth', exp: Math.floor(Date.now() / 1000) + 600 })).toString('base64url');
  return `${payload}.${signature(payload, config)}`;
}

function transaction(token, config) {
  if (!config.ready || typeof token !== 'string' || token.length > 2048) return null;
  const [payload, mac, extra] = token.split('.');
  if (!payload || extra !== undefined || !sameValue(signature(payload, config), mac)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return value.origin === config.origin && value.purpose === 'github-oauth' && Number.isFinite(value.exp) && value.exp > Date.now() / 1000 && /^[A-Za-z0-9_-]{43}$/.test(value.state) && /^[A-Za-z0-9_-]{43}$/.test(value.verifier) ? value : null;
  } catch { return null; }
}

export function createAuth(request, response, config) {
  const jar = new Map(String(request.headers.cookie || '').split(';').map(part => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }));
  const pending = new Map();
  function setCookie(kind, value, maxAge) {
    const cookieName = name(kind, config);
    jar.set(cookieName, value);
    pending.set(cookieName, `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${config.secure ? '; Secure' : ''}`);
    response.setHeader('Set-Cookie', [...pending.values()]);
  }
  function clear() {
    setCookie('session', '', 0);
    setCookie('oauth', '', 0);
    for (const cookieName of jar.keys()) {
      if (cookieName === name('context', config) || cookieName.startsWith(name('supabase', config))) {
        pending.set(cookieName, `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${config.secure ? '; Secure' : ''}`);
      }
    }
    response.setHeader('Set-Cookie', [...pending.values()]);
  }
  const client = config.ready ? createClient(config.supabaseUrl, config.databaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) }) },
  }) : null;
  return { client, jar, config, setCookie, clear };
}

export async function getSession(auth, config) {
  const token = auth.jar.get(name('session', config));
  if (!auth.client || !/^[A-Za-z0-9_-]{43}$/.test(token || '')) return null;
  const tokenHash = hashToken(token, config);
  const { data, error } = await auth.client.from('admin_sessions').select('github_id,login,csrf_token,expires_at,admin_users(display_name,avatar_url)').eq('token_hash', tokenHash).gt('expires_at', new Date().toISOString()).maybeSingle();
  if (error) throw new Error('Session storage unavailable');
  if (!data || data.github_id !== config.githubId || typeof data.login !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(data.csrf_token) || !Number.isFinite(Date.parse(data.expires_at)) || Date.parse(data.expires_at) <= Date.now()) return null;
  return { id: data.github_id, login: data.login, name: data.admin_users?.display_name || data.login, avatarUrl: data.admin_users?.avatar_url || null, csrf: data.csrf_token, exp: Date.parse(data.expires_at) / 1000, tokenHash };
}

export function beginLogin(auth, config) {
  const state = randomToken();
  const verifier = randomToken();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.search = new URLSearchParams({
    client_id: config.clientId, redirect_uri: `${config.origin}/api/admin?route=callback`,
    state, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256', allow_signup: 'false',
  });
  auth.setCookie('oauth', sealTransaction({ state, verifier }, config), 600);
  return url.toString();
}

export async function finishLogin(auth, url, config) {
  const pending = transaction(auth.jar.get(name('oauth', config)), config);
  auth.setCookie('oauth', '', 0);
  const code = url.searchParams.get('code');
  if (!pending || !sameValue(pending.state, url.searchParams.get('state')) || !code || code.length > 2048 || url.searchParams.has('error')) return false;
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, code, code_verifier: pending.verifier, redirect_uri: `${config.origin}/api/admin?route=callback` }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return false;
  const token = await response.json();
  if (typeof token.access_token !== 'string' || !token.access_token || token.error) return false;
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'NordheimLarssen-Admin' },
    signal: AbortSignal.timeout(10000),
  });
  if (!userResponse.ok) return false;
  const user = await userResponse.json();
  if (String(user.id) !== config.githubId || typeof user.login !== 'string' || !/^[A-Za-z0-9-]{1,39}$/.test(user.login)) return false;
  const { error: profileError } = await auth.client.from('admin_users').upsert({
    github_id: config.githubId, login: user.login,
    display_name: typeof user.name === 'string' ? user.name.slice(0, 200) : null,
    email: typeof user.email === 'string' ? user.email.slice(0, 320) : null,
    avatar_url: typeof user.avatar_url === 'string' && /^https:\/\/avatars\.githubusercontent\.com\//.test(user.avatar_url) && user.avatar_url.length <= 1024 ? user.avatar_url : null,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw new Error('Account storage unavailable');
  const sessionToken = randomToken();
  const { error } = await auth.client.from('admin_sessions').insert({ token_hash: hashToken(sessionToken, config), github_id: config.githubId, login: user.login, csrf_token: randomToken(), expires_at: new Date(Date.now() + SESSION_SECONDS * 1000).toISOString() });
  if (error) throw new Error('Session storage unavailable');
  auth.setCookie('session', sessionToken, SESSION_SECONDS);
  return true;
}

export async function logout(auth, session) {
  const { error } = await auth.client.from('admin_sessions').delete().eq('token_hash', session.tokenHash);
  if (error) throw new Error('Logout unavailable');
  auth.clear();
}
