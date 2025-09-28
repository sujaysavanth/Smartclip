export type Clip = {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  hashtags: string[];
  thumbnailUrl?: string;
  playbackUrl?: string;
};

type AnalyzeInput = { file?: File; url?: string };

const mockResponse: Clip[] = [
  {
    id: "c1",
    title: "Opening hook",
    startSec: 3,
    endSec: 14,
    hashtags: ["#hook", "#intro"]
  },
  {
    id: "c2",
    title: "Key insight",
    startSec: 35,
    endSec: 52,
    hashtags: ["#insight"]
  },
  {
    id: "c3",
    title: "Final takeaway",
    startSec: 90,
    endSec: 109,
    hashtags: ["#summary", "#highlight"]
  }
];

const MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK === "1";
const PUTER_SCRIPT_URL = process.env.NEXT_PUBLIC_PUTER_JS_URL ?? "https://js.puter.com/v2/puter.js";
const MAX_CLIPS = Number.parseInt(process.env.NEXT_PUBLIC_PUTER_MAX_CLIPS ?? "6", 10);

type PuterAnalyzeResponse =
  | { clips?: RawClip[]; highlights?: RawClip[] }
  | RawClip[]
  | undefined
  | null;

type PuterAnalyzeFn = (options: { file?: File; url?: string; max_clips?: number }) => Promise<PuterAnalyzeResponse>;

type PuterGlobal = {
  analyze?: PuterAnalyzeFn;
  analyzeVideo?: PuterAnalyzeFn;
  ai?: { analyze?: PuterAnalyzeFn };
  video?: { analyze?: PuterAnalyzeFn };
};

declare global {
  interface Window {
    puter?: PuterGlobal;
  }
}

let loadPuterPromise: Promise<PuterAnalyzeFn> | null = null;

function resolveAnalyzeFn(): PuterAnalyzeFn | undefined {
  const puter = typeof window === "undefined" ? undefined : window.puter;
  if (!puter) return undefined;
  return puter.analyze ?? puter.analyzeVideo ?? puter.ai?.analyze ?? puter.video?.analyze;
}

async function loadPuterAnalyze(): Promise<PuterAnalyzeFn> {
  if (typeof window === "undefined") {
    throw new Error("Video analysis must be triggered from the browser environment.");
  }

  const existing = resolveAnalyzeFn();
  if (existing) {
    return existing;
  }

  if (!loadPuterPromise) {
    loadPuterPromise = new Promise<PuterAnalyzeFn>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${PUTER_SCRIPT_URL}"]`);
      const script = existingScript ?? document.createElement("script");

      const cleanup = () => {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      };

      const handleLoad = () => {
        cleanup();
        script.dataset.puterLoaded = "true";
        const analyze = resolveAnalyzeFn();
        if (analyze) {
          resolve(analyze);
        } else {
          reject(new Error("Puter script loaded but no analyze function was found."));
        }
      };

      const handleError = () => {
        cleanup();
        reject(new Error("Failed to load the Puter.js script."));
      };

      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);

      if (script.dataset.puterLoaded === "true" || (script as { readyState?: string }).readyState === "complete") {
        handleLoad();
        return;
      }

      if (!existingScript) {
        script.async = true;
        script.src = PUTER_SCRIPT_URL;
        const parent = document.head ?? document.body ?? document.documentElement;
        if (!parent) {
          cleanup();
          reject(new Error("Unable to attach the Puter.js script tag."));
          return;
        }
        parent.appendChild(script);
      }
    });
  }

  return loadPuterPromise;
}

type RawClip = {
  id?: string;
  title?: string;
  start?: number | string;
  end?: number | string;
  startSec?: number | string;
  endSec?: number | string;
  startSeconds?: number | string;
  endSeconds?: number | string;
  startMs?: number | string;
  endMs?: number | string;
  startMilliseconds?: number | string;
  endMilliseconds?: number | string;
  duration?: number | string;
  hashtags?: string[];
  tags?: string[];
  thumbnailUrl?: string;
  thumbnail_url?: string;
  preview?: { url?: string };
  playback?: { url?: string };
  playbackUrl?: string;
  playback_url?: string;
};

function coerceSeconds(...values: Array<number | string | undefined>): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function coerceMilliseconds(...values: Array<number | string | undefined>): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function normalizeRawClip(raw: RawClip, index: number): Clip {
  const startMs = coerceMilliseconds(raw.startMs, raw.startMilliseconds);
  const endMs = coerceMilliseconds(raw.endMs, raw.endMilliseconds);

  const startSec = coerceSeconds(
    raw.startSec,
    raw.startSeconds,
    raw.start,
    typeof startMs === "number" ? startMs / 1000 : undefined
  );
  const endSec = coerceSeconds(
    raw.endSec,
    raw.endSeconds,
    raw.end,
    typeof endMs === "number" ? endMs / 1000 : undefined,
    typeof startSec === "number" && typeof raw.duration !== "undefined"
      ? startSec + Number(raw.duration)
      : undefined
  );

  if (typeof startSec !== "number" || !Number.isFinite(startSec)) {
    throw new Error(`Puter response clip #${index + 1} is missing a valid start time.`);
  }

  if (typeof endSec !== "number" || !Number.isFinite(endSec)) {
    throw new Error(`Puter response clip #${index + 1} is missing a valid end time.`);
  }

  const title = raw.title?.toString().trim();
  if (!title) {
    throw new Error(`Puter response clip #${index + 1} is missing a title.`);
  }

  const hashtags = Array.isArray(raw.hashtags) ? raw.hashtags : Array.isArray(raw.tags) ? raw.tags : [];

  const thumbnailUrl = raw.thumbnailUrl ?? raw.thumbnail_url ?? raw.preview?.url;
  const playbackUrl = raw.playbackUrl ?? raw.playback_url ?? raw.playback?.url;

  return {
    id: raw.id ?? `clip-${index}`,
    title,
    startSec,
    endSec,
    hashtags,
    thumbnailUrl,
    playbackUrl
  };
}

export async function analyzeVideo(input: AnalyzeInput): Promise<Clip[]> {
  if (!input.file && !input.url) {
    throw new Error("Please provide a file or a URL for analysis.");
  }

  if (MOCK_ENABLED) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return mockResponse;
  }

  const analyze = await loadPuterAnalyze();

  const payload = await analyze({
    file: input.file,
    url: input.url,
    max_clips: Number.isFinite(MAX_CLIPS) && MAX_CLIPS > 0 ? MAX_CLIPS : undefined
  });

  const structured = !Array.isArray(payload) && payload && typeof payload === "object" ? payload : undefined;

  const rawClips = Array.isArray(payload)
    ? payload
    : structured && Array.isArray((structured as { clips?: unknown }).clips)
      ? (structured as { clips: unknown[] }).clips
      : structured && Array.isArray((structured as { highlights?: unknown }).highlights)
        ? (structured as { highlights: unknown[] }).highlights
        : undefined;

  if (!rawClips) {
    throw new Error("Puter response did not include any clips.");
  }

  const normalized: Clip[] = [];
  rawClips.forEach((item, index) => {
    try {
      normalized.push(normalizeRawClip(item as RawClip, index));
    } catch (error) {
      console.warn(error);
    }
  });

  if (normalized.length === 0) {
    throw new Error("Puter did not return any usable clips. Try another video or check your integration.");
  }

  return normalized;
}
