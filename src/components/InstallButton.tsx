"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

const noSubscribe = () => () => {};
const isIosBrowser = () =>
  /iphone|ipad/i.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches;

export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const iosHint = useSyncExternalStore(noSubscribe, isIosBrowser, () => false);

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  if (prompt) {
    return (
      <button
        className="btn btn-quiet w-full"
        onClick={() => {
          prompt.prompt();
          setPrompt(null);
        }}
      >
        Add to home screen
      </button>
    );
  }
  if (iosHint) {
    return <p className="text-center text-sm text-muted">To install: tap Share, then Add to Home Screen.</p>;
  }
  return null;
}
