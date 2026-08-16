# KidTube — Kid-Safe YouTube Front End (mock)

Next.js App Router front end for the KidTube spec, currently running on mock data.
Three routes:

- `/` — kid-facing video grid (hidden three-dot menu leads to `/manage`)
- `/watch/[id]` — distraction-free player (mock surface; swap in the youtube-nocookie embed later)
- `/manage` — PIN-gated channel manager (any 4-digit PIN unlocks in mock mode)

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, import the repo and set **Root Directory** to `kidtube`.
3. Deploy — no environment variables are needed for the mock phase.

## Next phase (per spec)

- `app/api/videos`, `add-channel`, `remove-channel`, `search-channel` route handlers
- `channels.json` as source of truth, committed via the GitHub Contents API
- Env vars: `YOUTUBE_API_KEY`, `GITHUB_TOKEN`, `GITHUB_REPO`, `ADMIN_PIN`
- Service worker + real PWA icons (192/512) at `public/icons/`
