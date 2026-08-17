# KidTube — Kid-Safe YouTube Front End

Next.js App Router PWA. Whitelist-only video grid from parent-approved channels.

## Routes

- `/` — kid-facing video grid (`GET /api/videos`)
- `/watch/[id]` — youtube-nocookie embed player
- `/manage` — PIN-gated channel manager

## APIs

- `GET /api/videos` — uploads from `channels.json` via YouTube Data API
- `POST /api/verify-pin` — unlock manage UI
- `GET /api/search-channel?q=&pin=` — YouTube channel search (PIN required)
- `POST /api/add-channel` — commit channel to `kidtube/channels.json` via GitHub
- `POST /api/remove-channel` — remove channel via GitHub

## Local

```bash
cd kidtube
cp .env.example .env.local
# fill YOUTUBE_API_KEY, GITHUB_TOKEN, GITHUB_REPO, ADMIN_PIN
npm install
npm run dev
```

## Vercel

Root Directory = `kidtube`. Set the same four env vars. Framework = Next.js.
