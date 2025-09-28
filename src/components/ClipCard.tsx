"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import type { Clip } from "@/lib/puter";

function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

type ClipCardProps = {
  clip: Clip;
  masterSrc?: string;
};

export default function ClipCard({ clip, masterSrc }: ClipCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fragmentSrc = useMemo(() => {
    if (!masterSrc) return undefined;
    return `${masterSrc}#t=${clip.startSec},${clip.endSec}`;
  }, [clip.endSec, clip.startSec, masterSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (fragmentSrc) {
      video.src = fragmentSrc;
    } else if (masterSrc) {
      video.src = masterSrc;
    }
  }, [fragmentSrc, masterSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= clip.endSec) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleEnded = () => setIsPlaying(false);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [clip.endSec]);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video || !masterSrc) return;
    video.pause();
    video.src = masterSrc;
    video.load();
    video.currentTime = clip.startSec;
    try {
      await video.play();
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = clip.startSec;
    void video.play();
    setIsPlaying(true);
  };

  return (
    <article className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        {clip.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.thumbnailUrl} alt={clip.title} className="h-48 w-full object-cover" />
        ) : clip.playbackUrl ? (
          <video
            src={clip.playbackUrl}
            controls
            preload="metadata"
            className="h-48 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-brand/10 via-white to-brand/10 text-sm font-medium text-brand">
            Clip preview
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {formatTimestamp(clip.startSec)} – {formatTimestamp(clip.endSec)}
        </span>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{clip.title}</h3>
          <ul className="flex flex-wrap gap-2 text-sm text-brand">
            {clip.hashtags.map((tag) => (
              <li key={tag} className="rounded-full bg-brand/10 px-2.5 py-1 font-medium">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </li>
            ))}
          </ul>
        </div>
        {!clip.playbackUrl && masterSrc ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePlay}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
            >
              <PlayIcon className="h-4 w-4" aria-hidden="true" />
              {isPlaying ? "Playing" : "Play clip"}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-2 rounded-full border border-brand/40 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:text-brand"
            >
              <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
              Replay
            </button>
            <video ref={videoRef} preload="metadata" playsInline className="hidden" />
          </div>
        ) : null}
      </div>
    </article>
  );
}
