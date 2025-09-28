type ProgressProps = {
  message?: string;
};

export default function Progress({ message = "Analyzing with Puter…" }: ProgressProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-light/50 bg-surface-highlight/70 px-6 py-5 text-brand-light">
      <span
        className="inline-flex h-4 w-4 animate-spin rounded-full border-[3px] border-current border-t-transparent"
        aria-hidden="true"
      />
      <span className="font-medium text-slate-100" role="status">
        {message}
      </span>
    </div>
  );
}
