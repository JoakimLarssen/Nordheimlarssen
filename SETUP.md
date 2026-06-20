# nordheimlarssen.no — deploy (Vercel)

Static site, no build step. Hosted on **Vercel**, repo `JoakimLarssen/Nordheimlarssen`.

## 1. Import the repo into Vercel
1. Go to https://vercel.com → **Add New… → Project**.
2. **Import** `JoakimLarssen/Nordheimlarssen` (authorize the Vercel GitHub app for the repo if prompted).
3. Framework preset: **Other** (it's static HTML). No build command, no output dir override.
4. **Deploy**. You get a `*.vercel.app` URL immediately, and every push to `main` auto-deploys.

## 2. Add the custom domain
1. Project → **Settings → Domains** → add `nordheimlarssen.no` (and `www.nordheimlarssen.no`).
2. Vercel shows the exact DNS records to set. They are normally:

   | Type  | Host  | Value |
   |-------|-------|-------|
   | A     | `@`   | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

   (Use whatever Vercel displays; it is authoritative and may differ.)

## 3. Set DNS at your registrar (Domeneshop / Norid)
- Add the A record on the apex `@` and the CNAME on `www` from step 2.
- `.no` apex note: if Domeneshop will not let you put an A record on the apex, use its **ANAME/ALIAS** to `cname.vercel-dns.com` instead.
- Propagation is usually minutes, up to ~24h. Vercel issues HTTPS automatically once the records resolve.

## 4. Notes
- `thesis.pdf` lives at the repo root, so `https://nordheimlarssen.no/thesis.pdf` works.
- Optional later: redirect `joakimlarssen.github.io` to `nordheimlarssen.no` so there is one canonical URL.
- No `CNAME` file or `.nojekyll` is needed for Vercel (those are GitHub Pages artifacts).
