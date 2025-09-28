"use client";

import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const gradients = "bg-gradient-to-br from-brand to-brand-light";

export default function Hero() {
  const handleClick = () => {
    const el = document.getElementById("upload");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-3xl px-6 py-24 text-center text-white shadow-card",
        gradients,
        "mx-auto max-w-5xl"
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <div className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-medium uppercase tracking-wide">
            New · AI-powered highlights
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Turn any video into shareable highlights
          </h1>
          <p className="text-lg text-white/85 sm:text-xl">
            Upload a file or paste a link. Let AI find the moments that matter.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-brand transition hover:translate-y-0.5 hover:bg-white/90 focus-visible:ring-offset-brand"
        >
          Get started
          <ArrowDownIcon className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl" />
      </div>
    </section>
  );
}
