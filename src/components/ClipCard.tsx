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
    <article className="flex h-full flex-col rounded-3xl border border-surface-border/70 bg-surface-elevated/95 p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-light/50 hover:shadow-[0_30px_65px_-35px_rgba(0,245,212,0.5)]">
      <div className="relative overflow-hidden rounded-2xl bg-surface-highlight/60">
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
          <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-brand/20 via-transparent to-brand-light/20 text-sm font-medium text-brand-light">
            Clip preview
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {formatTimestamp(clip.startSec)} – {formatTimestamp(clip.endSec)}
        </span>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-white">{clip.title}</h3>
          <ul className="flex flex-wrap gap-2 text-sm text-brand-light">
            {clip.hashtags.map((tag) => (
              <li key={tag} className="rounded-full bg-brand-light/15 px-2.5 py-1 font-medium">
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
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm transition hover:bg-brand-light focus-visible:ring-2 focus-visible:ring-brand-light/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated"
            >
              <PlayIcon className="h-4 w-4" aria-hidden="true" />
              {isPlaying ? "Playing" : "Play clip"}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-2 rounded-full border border-brand-light/60 px-4 py-2 text-sm font-semibold text-brand-light transition hover:border-brand-light hover:text-white"
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
