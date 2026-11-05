"use client";

import { useRef, useState } from "react";

type Props = { uid: string; username: string; version: number };

export function ShareSheet({ uid, username, version }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);
  const imageUrl = `/api/card/${uid}?v=${version}`;
  const text = `${username}'s PUBG Mobile stats`;

  async function open() {
    setLink(`${window.location.origin}/p/${uid}`);
    dialog.current?.showModal();
    if (file) return;
    // Fetched ahead of the tap: phones only allow sharing right after a tap.
    const blob = await fetch(imageUrl).then((r) => r.blob()).catch(() => null);
    if (!blob) return;
    const png = new File([blob], `${uid}-card.png`, { type: "image/png" });
    setFile(png);
    setCanShareFile(!!navigator.canShare?.({ files: [png] }));
  }

  const encoded = encodeURIComponent(link);
  const message = encodeURIComponent(`${text} ${link}`);
  const targets = [
    { name: "WhatsApp", href: `https://wa.me/?text=${message}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encoded}&text=${encodeURIComponent(text)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(text)}` },
  ];

  return (
    <>
      <button type="button" className="btn btn-primary flex-1" onClick={open}>
        Share card
      </button>
      <dialog
        ref={dialog}
        aria-label="Share card"
        className="fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-none rounded-t-2xl border-t border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-ink"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="mx-auto max-w-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="num text-2xl font-bold">Share card</h2>
            <button type="button" className="btn -mr-3 text-muted" onClick={() => dialog.current?.close()}>
              Close
            </button>
          </div>
          <img src={imageUrl} alt={`${username}'s player card`} className="mx-auto max-h-[38dvh] rounded-lg" />
          {canShareFile && file && (
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => navigator.share({ files: [file], text, url: link }).catch(() => {})}
            >
              Share image
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {targets.map((t) => (
              <a key={t.name} href={t.href} target="_blank" rel="noreferrer" className="btn btn-quiet">
                {t.name}
              </a>
            ))}
            <button
              type="button"
              className="btn btn-quiet"
              onClick={async () => {
                await navigator.clipboard.writeText(link).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Link copied" : "Copy link"}
            </button>
            <a href={imageUrl} download={`${uid}-card.png`} className="btn btn-quiet">
              Save image
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
