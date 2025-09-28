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

## Project structure

- `src/app` – App Router pages and layout.
- `src/components` – Reusable UI components (hero, uploader, clip cards, etc.).
- `src/lib/puter.ts` – Thin integration layer for Puter.js with a mock implementation.

## Features

- Drag-and-drop uploads or direct video URLs.
- Progress state while Puter analyzes the video.
- Responsive highlight grid with playback controls.
- Accessible focus states and responsive layout from mobile to desktop.
