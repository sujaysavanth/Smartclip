# Smartclip

AI-powered video highlighter MVP built with Next.js and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_MOCK=1` to use the built-in fake Puter.js responses.

```bash
NEXT_PUBLIC_MOCK=1 npm run dev
```

## Puter integration

To use the live Puter pipeline, configure the Smartclip frontend with your Puter endpoint and (optionally) credentials:

```bash
# .env.local
NEXT_PUBLIC_PUTER_ANALYZE_URL="https://api.puter.com/v1/apps/<app-id>/analyze"
NEXT_PUBLIC_PUTER_APP_ID="<app-id>"             # optional header, if required by your Puter app
NEXT_PUBLIC_PUTER_API_KEY="<public-api-key>"    # optional bearer token for authenticated requests
NEXT_PUBLIC_PUTER_MAX_CLIPS=6                   # optional override for maximum clips requested
```

Restart the dev server after updating environment variables. If you don't yet have a Puter endpoint, enable `NEXT_PUBLIC_MOCK=1` to stay in demo mode.

## Project structure

- `src/app` – App Router pages and layout.
- `src/components` – Reusable UI components (hero, uploader, clip cards, etc.).
- `src/lib/puter.ts` – Thin integration layer for Puter.js with a mock implementation.

## Features

- Drag-and-drop uploads or direct video URLs.
- Progress state while Puter analyzes the video.
- Responsive highlight grid with playback controls.
- Accessible focus states and responsive layout from mobile to desktop.
