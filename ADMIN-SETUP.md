# Adminkonsoll med GitHub-innlogging

Nettsiden bruker native OAuth 2.0-ruter i Node.js på Vercel. GitHub er innloggingsleverandør. Supabase Postgres lagrer den private kontoen, øktene og maskinopplysningene. Supabase Auth er ikke del av innloggingsflyten.

[Innlogging på nettsiden](https://www.nordheimlarssen.no/admin/login). Lokal innlogging: http://127.0.0.1:4310/admin/login.

## GitHub og servervariabler

[GitHub OAuth-appen](https://github.com/settings/applications/3860015) heter **Nordheim Larssen Admin Console**. Registrerte callback-adresser er eksakte, uten wildcard:

```text
https://www.nordheimlarssen.no/api/admin?route=callback
http://127.0.0.1:4310/api/admin?route=callback
```

Knappen åpner GitHub i et eget vindu. Hovedsiden blir stående på nettsiden. Etter innlogging lukkes GitHub-vinduet; hovedsiden sjekker serverøkten og åpner adminkonsollen. Hvis nettleseren blokkerer vinduet, ber siden brukeren om å tillate det. GitHub krever sin egen autorisasjonsside og tilbyr ikke en innebygd passorddialog. Avbrutt eller avvist innlogging gir en melding uten tilgang til private data.

| Servervariabel | Verdi eller formål |
| --- | --- |
| `ADMIN_ORIGIN` | `https://www.nordheimlarssen.no` i produksjon; `http://127.0.0.1:4310` lokalt |
| `ADMIN_GITHUB_ID` | `147814557`, den faste GitHub-ID-en til JoakimLarssen |
| `ADMIN_SESSION_SECRET` | Tilfeldige 32 bytes kodet som base64url; minst 43 tegn. Egen verdi per miljø |
| `GITHUB_CLIENT_ID` | Klient-ID fra GitHub OAuth-appen |
| `GITHUB_CLIENT_SECRET` | Klienthemmelighet fra samme app |
| `SUPABASE_URL` | `https://iawkryldywvoduflgxxy.supabase.co` |
| `SUPABASE_SECRET_KEY` | Privat `sb_secret_`-nøkkel, kun på serveren |
| `TAILSCALE_CLIENT_ID` | Valgfri OAuth-klient med `devices:core:read` |
| `TAILSCALE_CLIENT_SECRET` | Hemmeligheten til Tailscale-klienten |
| `TAILSCALE_TAILNET` | `-` for klientens eget nettverk |

De sju innloggings- og databasevariablene er lagt inn som hemmelige Production-variabler i Vercel. Verdiene kan ikke vises igjen der. Lokal konfigurasjon ligger i den Git-ignorerte `.env.local`. Ingen hemmeligheter skal legges i kildekode, HTML, JavaScript for nettleseren eller databaseprofiler. Preview-miljøer trenger egne registrerte callback-adresser og konfigurasjon før innlogging kan brukes der.

## Konto og økter

`public.admin_users` lagrer GitHub-ID, brukernavn, navn, offentlig e-postadresse hvis tilgjengelig, avatar-URL og oppdateringstid. GitHub-ID-en er nøkkelen mellom lokal konto og leverandør. Privat e-post kan være `null`; appen ber ikke om ekstra e-post- eller repository-tilgang.

Serveren kontrollerer GitHub-brukeren gjennom `/user` etter kodeutvekslingen. Bare ID `147814557` får tilgang. Kontoen opprettes eller oppdateres før økten, og databasen håndhever koblingen med en fremmednøkkel. Avatarer tillates bare fra `avatars.githubusercontent.com`.

`public.admin_sessions` lagrer SHA-256-hashen av et tilfeldig økttoken, GitHub-ID, CSRF-token og utløpstid. Rå økttokens og GitHub access tokens lagres ikke i databasen. GitHub-tokenet brukes bare under innloggingen. Hver privat forespørsel sjekker at økten finnes og ikke er utløpt. Økter varer i åtte timer. Utlogging sletter den gjeldende økten; slett alle rader i `admin_sessions` for å avslutte alle økter. Utløpte rader kan ryddes med `delete from public.admin_sessions where expires_at <= now();`.

Innloggingen bruker tilfeldig `state` og PKCE med S256. Den midlertidige OAuth-informasjonskapselen er signert, bundet til nettsidens origin og gyldig i ti minutter. Økttokens er også bundet til origin. Informasjonskapsler er HttpOnly og SameSite=Lax; i produksjon brukes Secure og `__Host-`-prefiks. Oppdatering og utlogging krever POST, korrekt Origin og øktens CSRF-token. Popup-meldinger inneholder ingen hemmeligheter og kan ikke alene gi innlogging: hovedsiden sjekker økten på serveren.

## Private databaseopplysninger

[Supabase-prosjektet nordheimlarssen](https://supabase.com/dashboard/project/iawkryldywvoduflgxxy) ligger i den separate organisasjonen Nordheim Larssen, på Free-plan i Europa.

RLS er aktivert på alle tre admin-tabellene. `anon` og `authenticated`, inkludert tidligere Supabase Auth-brukere, har ingen rettigheter til å lese eller endre tabellene. Appens servernøkkel har privilegert tilgang, så serverens kontroll av GitHub-ID og databaseøkt er obligatorisk på alle private ruter. Nettleseren kontakter bare nettsidens eget API.

Alle fire migrasjonene i `supabase/migrations` er kjørt gjennom SQL Editor på dette prosjektet. De to første dokumenterer det opprinnelige tabelloppsettet; de to siste erstatter Supabase Auth-tilgangen med direkte GitHub-økter og kontoprofiler. Ikke kjør opprettelsesmigrasjonene på nytt. SQL Editor oppdaterer ikke CLI-migrasjonshistorikken; registrer eksisterende migrasjoner som utført før senere bruk av CLI-migrering.

## Maskiner og Tailscale

`public.admin_devices` har fire faste plasser: `laptop`, `mac-mini`, `desktop` og `macbook`. Feltene `tailscale_device_id`, `ssh_user` og `ssh_port` knytter hver plass til riktig maskin. Desktop-brukeren er `joaki`. Laptop og Mac mini har ikke bekreftet SSH-brukernavn. MacBook er planlagt.

Knappen «Oppdater adresser» leser registrerte enheter fra Tailscale og lagrer et begrenset nettverkssnapshot i Supabase. Neste innlogging bruker lagrede data. Ingen SSH-passord eller private SSH-nøkler lagres. En registrert adresse bekrefter ikke at SSH svarer; maskinen må være våken og ha SSH aktivert.

En Tailscale OAuth-klient med kun `devices:core:read` kan opprettes under [Trust credentials](https://console.tailscale.com/admin/settings/oauth). Appen endrer ikke Tailscale-brukere eller maskiner. Tailscale-tilkobling, riktige maskin-ID-er og SSH på de faktiske maskinene er fortsatt ikke konfigurert eller verifisert.

## Kjøring og beskyttede filer

```sh
npm ci
npm run dev
```

`npm run build` kopierer bare offentlige filer til `dist`. API-kode, private HTML-maler, dokumentasjon, database-migrasjoner og miljøfiler er utelatt. Vercel sender `/admin` og `/admin/login` gjennom Node-handleren. Private svar har `no-store` for nettleser og CDN. GitHub-login er tilgjengelig både lokalt og med HTTPS på produksjonsdomenet.

## Verifikasjon

27 direkte runtime-kontroller av OAuth, PKCE, signert state, avvist bruker, private informasjonskapsler, kontoopprettelse før økt, hashet lagring og utlogging bestod. Disse brukte simulerte GitHub- og databasesvar. Ekte GitHub-innlogging med popup er også verifisert lokalt som JoakimLarssen, med de fire maskinradene hentet fra Supabase. Ekte utlogging fungerte.

Tailscale-svar i tidligere runtime-kontroller var simulerte. Ingen faktisk SSH-tilkobling er bekreftet gjennom denne løsningen.
