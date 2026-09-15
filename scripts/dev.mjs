import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
try { process.loadEnvFile(path.join(root, '.env.local')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
await import('./build.mjs');
const { default: admin } = await import('../api/admin.mjs');
const output = path.join(root, 'dist');
const port = Number(process.env.PORT || 4310);
process.env.ADMIN_ORIGIN ||= `http://127.0.0.1:${port}`;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (['/admin', '/admin/', '/admin/login', '/admin/login/'].includes(url.pathname)) {
      url.searchParams.set('route', url.pathname.includes('/login') ? 'login-page' : 'page');
      request.url = `/api/admin?${url.searchParams}`;
      return await admin(request, response);
    }
    if (url.pathname === '/api/admin') return await admin(request, response);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let filename = path.resolve(output, relative);
    if (filename !== output && !filename.startsWith(`${output}${path.sep}`)) throw new Error('Not found');
    let metadata;
    try { metadata = await stat(filename); } catch {}
    if (metadata?.isDirectory()) filename = path.join(filename, 'index.html');
    const data = await readFile(filename);
    response.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.end(data);
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local login: http://127.0.0.1:${port}/admin/login`));
