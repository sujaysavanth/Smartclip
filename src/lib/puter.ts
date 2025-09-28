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

export async function analyzeVideo(input: AnalyzeInput): Promise<Clip[]> {
  if (!input.file && !input.url) {
    throw new Error("Please provide a file or a URL for analysis.");
  }

  if (MOCK_ENABLED) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return mockResponse;
  }

  // Placeholder for future Puter.js integration.
  // This throws to make it clear the real integration is pending.
  throw new Error("Puter.js integration not yet configured. Set NEXT_PUBLIC_MOCK=1 for demo mode.");
}
