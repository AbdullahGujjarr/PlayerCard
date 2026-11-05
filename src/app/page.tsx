import Link from "next/link";
import { InstallButton } from "@/components/InstallButton";
import { LeaderList } from "@/components/LeaderList";
import { UidSearch } from "@/components/UidSearch";
import { APP_NAME, DISCLAIMER, TAGLINE } from "@/lib/brand";
import { getSessionUid } from "@/lib/session";
import { getLeaderboard } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [uid, top] = await Promise.all([getSessionUid(), getLeaderboard("week", "kills", null, 5)]);
  return (
    <div className="space-y-7">
      <header>
        <p className="num text-xl font-bold tracking-widest text-accent">{APP_NAME.toUpperCase()}</p>
        <h1 className="num mt-1 text-4xl leading-none font-bold">{TAGLINE}</h1>
        <p className="mt-2 text-muted">Log each match with a screenshot, watch your progress, and share your card anywhere.</p>
      </header>

      <UidSearch />

      {!uid && (
        <div className="flex gap-2">
          <Link href="/register" className="btn btn-primary flex-1">
            Create your card
          </Link>
          <Link href="/login" className="btn btn-quiet flex-1">
            Log in
          </Link>
        </div>
      )}

      <section aria-labelledby="top-title">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="top-title" className="num text-2xl font-bold">
            Top killers this week
          </h2>
          <Link href="/leaderboard" className="min-h-8 font-semibold text-accent">
            All ranks
          </Link>
        </div>
        {top.length > 0 ? (
          <LeaderList rows={top} metric="kills" />
        ) : (
          <p className="rounded-xl border border-line bg-surface p-4 text-muted">No matches this week yet. Be the first on the board.</p>
        )}
      </section>

      <InstallButton />
      <p className="text-center text-xs text-muted">{DISCLAIMER}</p>
    </div>
  );
}
