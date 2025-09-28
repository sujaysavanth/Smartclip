"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Hero from "@/components/Hero";
import Uploader from "@/components/Uploader";
import Progress from "@/components/Progress";
import ClipsGrid from "@/components/ClipsGrid";
import { analyzeVideo, type Clip } from "@/lib/puter";

function normalizeHashtags(raw: string[] | undefined, title: string): string[] {
  const cleanedTitleTags = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => `#${word}`);

  const all = [...(raw ?? []), ...cleanedTitleTags];
  const seen = new Set<string>();
  return all
    .map((tag) => (tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase().replace(/[^a-z0-9]/g, "")}`))
    .filter((tag) => {
      if (!tag || tag === "#") return false;
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    })
    .slice(0, 6);
}

type SourceState = {
  url: string;
  type: "file" | "url";
  name?: string;
};

export default function HomePage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [source, setSource] = useState<SourceState | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const masterSrc = useMemo(() => source?.url ?? undefined, [source?.url]);

  const handleAnalyze = useCallback(
    async ({ file, url }: { file?: File; url?: string }) => {
      setAnalyzing(true);
      setError(undefined);
      setHasSubmitted(true);

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }

      try {
        let nextSource: SourceState | null = null;
        if (file) {
          const blobUrl = URL.createObjectURL(file);
          setObjectUrl(blobUrl);
          nextSource = { url: blobUrl, type: "file", name: file.name };
        } else if (url) {
          nextSource = { url, type: "url", name: url };
        }
        setSource(nextSource);

        const response = await analyzeVideo({ file, url });
        const enriched = response.map((clip, index) => ({
          ...clip,
          id: clip.id ?? `clip-${index}`,
          hashtags: normalizeHashtags(clip.hashtags, clip.title)
        }));
        setClips(enriched);
      } catch (err) {
        console.error(err);
        setClips([]);
        setError(err instanceof Error ? err.message : "Something went wrong while analyzing.");
      } finally {
        setAnalyzing(false);
      }
    },
    [objectUrl]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-12 sm:px-8">
      <Hero />
      <Uploader onAnalyze={handleAnalyze} analyzing={analyzing} error={error} />

      <section aria-live="polite" className="space-y-6">
        {analyzing ? <Progress /> : null}

        {hasSubmitted && !analyzing ? (
          clips.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Highlights</h2>
                  {source ? (
                    <p className="text-sm text-gray-500">
                      Source: {source.type === "file" ? source.name ?? "Uploaded file" : source.url}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">
                  {source?.type === "file"
                    ? "Playback buttons use your uploaded file."
                    : "Playback buttons use the original URL."}
                </p>
              </div>
              <ClipsGrid clips={clips} masterSrc={masterSrc} />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-600">
              <p className="text-lg font-semibold text-gray-800">No highlights detected.</p>
              <p className="mt-2 text-sm">Try another video or adjust your source.</p>
            </div>
          )
        ) : null}
      </section>
    </main>
  );
}
