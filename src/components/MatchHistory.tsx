"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { screenshotThumb } from "@/lib/cloudinary-url";
import { formatDay, formatNumber } from "@/lib/format";
import type { MatchView } from "@/lib/types";
import { postJson } from "./client-api";

type Props = { uid: string; initial: MatchView[]; initialHasMore: boolean; isOwner: boolean };

export function MatchHistory({ uid, initial, initialHasMore, isOwner }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadMore() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/players/${uid}/matches?skip=${items.length}`);
      if (!response.ok) throw new Error();
      const page = await response.json();
      setItems((current) => [...current, ...page.items]);
      setHasMore(page.hasMore);
    } catch {
      setError("Couldn't load more matches. Try again.");
    }
    setLoading(false);
  }

  async function remove(id: string) {
    setError("");
    try {
      await postJson(`/api/matches/${id}`, {}, "DELETE");
      setItems((current) => current.filter((m) => m.id !== id));
      setConfirming(null);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section aria-labelledby="history-title">
      <h2 id="history-title" className="num mb-3 text-2xl font-bold">
        Match history
      </h2>
      {items.length === 0 && (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">
          {isOwner ? "Add your first match to fill your card." : "No matches added yet."}
        </p>
      )}
      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m.id} className="rounded-xl border border-line bg-surface p-3">
            <div className="flex gap-3">
              <a href={m.screenshotUrl} target="_blank" rel="noreferrer" className="shrink-0" aria-label={`Open screenshot from ${formatDay(m.playedOn)}`}>
                <img src={screenshotThumb(m.screenshotUrl)} alt="" loading="lazy" className="h-16 w-24 rounded-md bg-raised object-cover" />
              </a>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline justify-between gap-2">
                  <span className={`num text-xl font-bold ${m.placement === 1 ? "text-accent" : ""}`}>
                    {m.placement === 1 ? "Winner" : `#${m.placement}`}
                  </span>
                  <span className="text-sm text-muted">{formatDay(m.playedOn)}</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  <b className="num text-base text-ink">{m.kills}</b> kills <span aria-hidden>·</span>{" "}
                  <b className="num text-base text-ink">{formatNumber(m.damage)}</b> dmg <span aria-hidden>·</span>{" "}
                  <b className="num text-base text-ink">{m.survivalMin}</b> min
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="mt-1 flex justify-end gap-2">
                {confirming === m.id ? (
                  <>
                    <button type="button" className="min-h-10 px-3 text-sm text-muted" onClick={() => setConfirming(null)}>
                      Keep
                    </button>
                    <button type="button" className="min-h-10 px-3 text-sm font-semibold text-danger" onClick={() => remove(m.id)}>
                      Delete this match
                    </button>
                  </>
                ) : (
                  <button type="button" className="min-h-10 px-3 text-sm text-muted" onClick={() => setConfirming(m.id)}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-danger">
          {error}
        </p>
      )}
      {hasMore && (
        <button type="button" className="btn btn-quiet mt-3 w-full" disabled={loading} onClick={loadMore}>
          {loading ? "Loading..." : "Show more matches"}
        </button>
      )}
    </section>
  );
}
