"use client";

import { useCallback, useRef, useState } from "react";
import { clsx } from "clsx";

const ACCEPTED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska"
];

export type UploaderProps = {
  onAnalyze: (payload: { file?: File; url?: string }) => void;
  analyzing: boolean;
  error?: string;
};

export default function Uploader({ onAnalyze, analyzing, error }: UploaderProps) {
  const [file, setFile] = useState<File | undefined>();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      setFile(undefined);
      return;
    }

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setFile(undefined);
      setUrlError(`Unsupported file type. Allowed: ${ACCEPTED_TYPES.join(", ")}`);
      event.target.value = "";
      return;
    }

    setUrlError(undefined);
    setFile(nextFile);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setUrlError(`Unsupported file type. Allowed: ${ACCEPTED_TYPES.join(", ")}`);
      return;
    }
    setUrlError(undefined);
    setFile(nextFile);
    if (inputRef.current) {
      inputRef.current.files = event.dataTransfer.files;
    }
  }, []);

  const validateUrl = useCallback((value: string) => {
    if (!value) {
      setUrlError(undefined);
      return true;
    }
    try {
      const parsed = new URL(value);
      if (!/^https?:$/.test(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
      setUrlError(undefined);
      return true;
    } catch {
      setUrlError("Enter a valid http(s) URL.");
      return false;
    }
  }, []);

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setUrl(nextValue);
      if (nextValue) {
        validateUrl(nextValue);
      } else {
        setUrlError(undefined);
      }
    },
    [validateUrl]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (analyzing) return;
      const isUrlValid = validateUrl(url);
      if (!file && !url) {
        setUrlError("Upload a video or paste a URL to continue.");
        return;
      }
      if (!isUrlValid) return;
      onAnalyze({ file, url: url || undefined });
    },
    [analyzing, file, onAnalyze, url, validateUrl]
  );

  const hasSelection = !!file || !!url;

  return (
    <section id="upload" className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white p-8 shadow-sm">
      <header className="space-y-3 text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Upload or paste a link</h2>
        <p className="text-base text-gray-600">AI highlights in seconds. Analysis may take longer for long videos.</p>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="videoFile"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={clsx(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
            file ? "border-brand bg-brand/5" : "border-gray-300 hover:border-brand/70 hover:bg-brand/5"
          )}
        >
          <input
            id="videoFile"
            name="videoFile"
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            ref={inputRef}
            className="sr-only"
            onChange={handleFileChange}
          />
          <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">Drag & drop</span>
          <p className="text-base font-semibold text-gray-900">Drop your video here, or click to browse</p>
          <p className="text-sm text-gray-500">Supported formats: MP4, WebM, OGG, MOV, MKV</p>
          {file ? <p className="text-sm text-brand">Selected: {file.name}</p> : null}
        </label>

        <div className="space-y-2">
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
            Or paste a video URL
          </label>
          <input
            id="videoUrl"
            type="url"
            inputMode="url"
            placeholder="https://example.com/video.mp4"
            value={url}
            onChange={handleUrlChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-brand"
          />
          {urlError ? <p className="text-sm text-rose-600" role="alert">{urlError}</p> : null}
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={!hasSelection || analyzing}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-brand/50"
          >
            {analyzing ? "Analyzing…" : "Analyze"}
          </button>
          <p className="text-sm text-gray-500">Your media stays on this device in mock mode.</p>
        </div>
      </form>
    </section>
  );
}
