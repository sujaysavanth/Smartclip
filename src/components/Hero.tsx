"use client";

import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

export default function Hero() {
  const handleClick = () => {
    const el = document.getElementById("upload");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-surface-border/80 bg-surface-elevated/95 px-6 py-24 text-center text-slate-100 shadow-card",
        "mx-auto max-w-5xl"
      )}
    >
      <div className="absolute inset-0 -z-10 bg-hero-radial opacity-80" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand/25 via-transparent to-brand-light/20" aria-hidden="true" />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <div className="space-y-4">
          <p className="inline-flex items-center rounded-full border border-brand-light/40 bg-brand-light/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
            New · AI-powered highlights
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white drop-shadow-[0_8px_35px_rgba(0,245,212,0.25)] sm:text-5xl">
            Turn any video into shareable highlights
          </h1>
          <p className="text-lg text-slate-200 sm:text-xl">
            Upload a file or paste a link. Let AI find the moments that matter.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="group inline-flex items-center gap-2 rounded-full bg-brand-light px-6 py-3 text-base font-semibold text-brand-dark transition hover:translate-y-0.5 hover:bg-brand focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          Get started
          <ArrowDownIcon className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
