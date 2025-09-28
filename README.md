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

The production flow loads the official Puter.js script in the browser and calls its `analyze` helper directly. To point the app at a self-hosted copy of the script or tweak the clip limit, provide the optional environment variables below:

```bash
# .env.local (optional overrides)
NEXT_PUBLIC_PUTER_JS_URL="https://js.puter.com/v2/puter.js"
NEXT_PUBLIC_PUTER_MAX_CLIPS=6
```

Restart the dev server after updating environment variables. If you don't yet have credentials, enable `NEXT_PUBLIC_MOCK=1` to stay in demo mode.

## Project structure

- `src/app` – App Router pages and layout.
- `src/components` – Reusable UI components (hero, uploader, clip cards, etc.).
- `src/lib/puter.ts` – Thin integration layer for Puter.js with a mock implementation.

## Features

- Drag-and-drop uploads or direct video URLs.
- Progress state while Puter analyzes the video.
- Responsive highlight grid with playback controls.
- Accessible focus states and responsive layout from mobile to desktop.
