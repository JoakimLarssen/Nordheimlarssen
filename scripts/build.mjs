import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const publicFolders = new Set(['about', 'admin', 'ctf', 'cv', 'fonts', 'icons', 'images', 'no', 'portfolio', 'uses', 'writing']);
const publicExtensions = new Set(['.html', '.css', '.js', '.pdf', '.svg', '.ico', '.png', '.jpg', '.jpeg', '.webp', '.woff2', '.webmanifest', '.xml']);

if (path.dirname(output) !== path.resolve(root)) throw new Error('Invalid output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isDirectory() ? publicFolders.has(entry.name) : publicExtensions.has(path.extname(entry.name)) || entry.name === 'robots.txt') {
    await cp(path.join(root, entry.name), path.join(output, entry.name), { recursive: true });
  }
}
console.log('Public site built in dist/. Server code and private configuration are excluded.');
