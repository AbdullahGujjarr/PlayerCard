"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { localToday } from "@/lib/format";
import { parseMatchText, type ParsedMatch } from "@/lib/ocr-parse";
import { postJson, shrinkImage, uploadImage } from "./client-api";

type Key = "kills" | "damage" | "survivalMin" | "placement";

const FIELDS: { key: Key; label: string; hint: string; decimal?: boolean }[] = [
  { key: "kills", label: "Eliminations", hint: "Kills in this match" },
  { key: "damage", label: "Damage", hint: "Total damage dealt" },
  { key: "survivalMin", label: "Survived (min)", hint: "Minutes alive", decimal: true },
  { key: "placement", label: "Finish position", hint: "1 means you won" },
];

const EMPTY: Record<Key, string> = { kills: "", damage: "", survivalMin: "", placement: "" };

type OcrState = "idle" | "reading" | "found" | "none";

async function readScreenshot(image: Blob): Promise<ParsedMatch> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(image);
    return parseMatchText(data.text);
  } finally {
    await worker.terminate();
  }
}

export function UploadForm({ uid }: { uid: string }) {
  const router = useRouter();
  const [image, setImage] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [values, setValues] = useState(EMPTY);
  const [autoFilled, setAutoFilled] = useState<Key[]>([]);
  const [ocr, setOcr] = useState<OcrState>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [playedOn, setPlayedOn] = useState(localToday);
  const pickId = useRef(0);

  async function pick(file: File) {
    const id = ++pickId.current;
    setError("");
    setPreview(URL.createObjectURL(file));
    setAutoFilled([]);
    setOcr("reading");
    try {
      const blob = await shrinkImage(file, 1600);
      if (id !== pickId.current) return;
      setImage(blob);
      const parsed = await readScreenshot(blob);
      if (id !== pickId.current) return;
      const found = (Object.keys(EMPTY) as Key[]).filter((k) => parsed[k] !== undefined);
      // Never overwrite anything the player already typed.
      setValues((current) => {
        const next = { ...current };
        for (const k of found) if (!next[k]) next[k] = String(parsed[k]);
        return next;
      });
      setAutoFilled(found);
      setOcr(found.length ? "found" : "none");
    } catch {
      if (id === pickId.current) setOcr("none");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!image) {
      setError("Add your match result screenshot first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const screenshotUrl = await uploadImage(image, "screenshot");
      await postJson("/api/matches", {
        playedOn,
        screenshotUrl,
        kills: Number(values.kills),
        damage: Number(values.damage),
        survivalMin: Number(values.survivalMin),
        placement: Number(values.placement),
      });
      router.push(`/p/${uid}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const ocrMessage: Record<OcrState, string> = {
    idle: "",
    reading: "Reading your screenshot. You can start typing now.",
    found: "Filled in what we could read. Check each number before saving.",
    none: "Couldn't read the numbers. Please type them in.",
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block cursor-pointer overflow-hidden rounded-lg border border-dashed border-line bg-surface focus-within:outline-2 focus-within:outline-accent">
        {preview ? (
          <img src={preview} alt="Your match screenshot" className="max-h-64 w-full object-contain" />
        ) : (
          <span className="flex min-h-40 flex-col items-center justify-center gap-1 p-4 text-center">
            <span className="font-semibold text-accent">Choose your result screenshot</span>
            <span className="text-sm text-muted">The end-of-match screen with your stats</span>
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) pick(file);
          }}
        />
      </label>
      {ocr !== "idle" && (
        <p role="status" className="text-sm text-muted">
          {ocrMessage[ocr]}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="mb-1.5 block font-medium">
              {f.label}
            </label>
            <input
              id={f.key}
              required
              type="number"
              inputMode={f.decimal ? "decimal" : "numeric"}
              step={f.decimal ? "0.1" : "1"}
              min={f.key === "placement" ? 1 : 0}
              className={`field num text-xl ${autoFilled.includes(f.key) ? "border-accent" : ""}`}
              value={values[f.key]}
              onChange={(e) => {
                setValues((v) => ({ ...v, [f.key]: e.target.value }));
                setAutoFilled((a) => a.filter((k) => k !== f.key));
              }}
            />
            <p className="mt-1 text-sm text-muted">{f.hint}</p>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="playedOn" className="mb-1.5 block font-medium">
          Match date
        </label>
        <input
          id="playedOn"
          type="date"
          required
          max={localToday()}
          className="field"
          value={playedOn}
          onChange={(e) => setPlayedOn(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Saving match..." : "Save match"}
      </button>
    </form>
  );
}
