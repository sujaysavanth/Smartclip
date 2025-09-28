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
const ANALYZE_URL = process.env.NEXT_PUBLIC_PUTER_ANALYZE_URL;
const API_KEY = process.env.NEXT_PUBLIC_PUTER_API_KEY;
const APP_ID = process.env.NEXT_PUBLIC_PUTER_APP_ID;
const MAX_CLIPS = Number.parseInt(process.env.NEXT_PUBLIC_PUTER_MAX_CLIPS ?? "6", 10);

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

  if (!ANALYZE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_PUTER_ANALYZE_URL. Provide your Puter analyze endpoint or enable NEXT_PUBLIC_MOCK=1."
    );
  }

  if (typeof window === "undefined") {
    throw new Error("Video analysis must be triggered from the browser environment.");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }
  if (APP_ID) {
    headers["X-Puter-App-Id"] = APP_ID;
  }

  const body = new FormData();
  if (input.file) {
    body.append("file", input.file);
  }
  if (input.url) {
    body.append("url", input.url);
  }
  if (Number.isFinite(MAX_CLIPS) && MAX_CLIPS > 0) {
    body.append("max_clips", String(MAX_CLIPS));
  }

  const response = await fetch(ANALYZE_URL, {
    method: "POST",
    headers,
    body,
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Puter request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      const details = errorData?.message ?? errorData?.error ?? JSON.stringify(errorData);
      if (details) {
        message = `${message}: ${details}`;
      }
    } catch (error) {
      // ignore parse errors
    }
    throw new Error(message);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("Puter response was not valid JSON.");
  }

  const rawClips = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { clips?: unknown }).clips)
      ? (payload as { clips: unknown[] }).clips
      : Array.isArray((payload as { highlights?: unknown }).highlights)
        ? (payload as { highlights: unknown[] }).highlights
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
