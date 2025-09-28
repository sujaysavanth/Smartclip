import type { Clip } from "@/lib/puter";
import ClipCard from "./ClipCard";

type ClipsGridProps = {
  clips: Clip[];
  masterSrc?: string;
};

export default function ClipsGrid({ clips, masterSrc }: ClipsGridProps) {
  if (clips.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-surface-border/80 bg-surface-highlight/70 p-12 text-center text-slate-300">
        <p className="text-lg font-semibold text-white">No highlights detected.</p>
        <p className="mt-2 text-sm text-slate-400">Try another video or tweak your source.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} masterSrc={masterSrc} />
      ))}
    </div>
  );
}
