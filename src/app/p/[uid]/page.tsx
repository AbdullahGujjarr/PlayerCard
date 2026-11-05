import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchHistory } from "@/components/MatchHistory";
import { PlayerCard } from "@/components/PlayerCard";
import { ProgressChart } from "@/components/ProgressChart";
import { ShareSheet } from "@/components/ShareSheet";
import { formatNumber } from "@/lib/format";
import { getSessionUid } from "@/lib/session";
import { getHistory, getPlayer, getTotals } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/p/[uid]">): Promise<Metadata> {
  const { uid } = await props.params;
  const player = await getPlayer(uid);
  if (!player) return { title: "Player not found" };
  const totals = await getTotals(uid);
  const title = `${player.username} (UID ${uid})`;
  const description = `${formatNumber(totals.matches)} matches, ${formatNumber(totals.kills)} kills, ${formatNumber(totals.damage)} damage in PUBG Mobile.`;
  const image = `/api/card/${uid}?format=og&v=${totals.matches}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function PlayerPage(props: PageProps<"/p/[uid]">) {
  const { uid } = await props.params;
  const [player, totals, history, sessionUid] = await Promise.all([
    getPlayer(uid),
    getTotals(uid),
    getHistory(uid),
    getSessionUid(),
  ]);
  if (!player) notFound();
  const isOwner = sessionUid === uid;

  return (
    <div className="space-y-5">
      <PlayerCard player={player} totals={totals} />
      <div className="flex gap-2">
        <ShareSheet uid={uid} username={player.username} version={totals.matches} />
        {isOwner && (
          <>
            <Link href="/upload" className="btn btn-quiet flex-1">
              Add match
            </Link>
            <Link href="/edit" className="btn btn-quiet">
              Edit
            </Link>
          </>
        )}
      </div>
      <ProgressChart uid={uid} />
      <MatchHistory key={totals.matches} uid={uid} initial={history.items} initialHasMore={history.hasMore} isOwner={isOwner} />
      <p className="text-center text-xs text-muted">Stats are entered by the player. Tap a screenshot to see the proof.</p>
    </div>
  );
}
