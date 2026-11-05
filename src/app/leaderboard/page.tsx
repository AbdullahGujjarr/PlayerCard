import type { Metadata } from "next";
import Link from "next/link";
import { CountryFilter } from "@/components/CountryFilter";
import { LeaderList } from "@/components/LeaderList";
import { COUNTRY_CODES } from "@/lib/countries";
import { getLeaderboard, MIN_KD_MATCHES } from "@/lib/stats";
import type { LeaderMetric, LeaderPeriod } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leaderboard" };

const PERIODS: { id: LeaderPeriod; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "all", label: "All time" },
];

const METRICS: { id: LeaderMetric; label: string }[] = [
  { id: "kills", label: "Kills" },
  { id: "damage", label: "Damage" },
  { id: "kd", label: "K/D" },
];

function Tabs<T extends string>({
  label,
  items,
  active,
  href,
}: {
  label: string;
  items: { id: T; label: string }[];
  active: T;
  href: (id: T) => string;
}) {
  return (
    <nav aria-label={label} className="flex gap-1 rounded-lg bg-surface p-1">
      {items.map((item) => (
        <Link
          key={item.id}
          href={href(item.id)}
          replace
          scroll={false}
          aria-current={item.id === active ? "true" : undefined}
          className={`flex min-h-10 flex-1 items-center justify-center rounded-md text-sm font-semibold ${item.id === active ? "bg-raised text-ink" : "text-muted"}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function LeaderboardPage(props: PageProps<"/leaderboard">) {
  const query = await props.searchParams;
  const period = PERIODS.find((p) => p.id === query.period)?.id ?? "week";
  const metric = METRICS.find((m) => m.id === query.metric)?.id ?? "kills";
  const country = COUNTRY_CODES.find((c) => c === query.country) ?? null;
  const rows = await getLeaderboard(period, metric, country);

  const link = (next: { period?: LeaderPeriod; metric?: LeaderMetric }) => {
    const params = new URLSearchParams({ period, metric, ...next });
    if (country) params.set("country", country);
    return `/leaderboard?${params}`;
  };

  return (
    <div className="space-y-3">
      <h1 className="num text-3xl font-bold">Leaderboard</h1>
      <Tabs label="Period" items={PERIODS} active={period} href={(id) => link({ period: id })} />
      <Tabs label="Ranking stat" items={METRICS} active={metric} href={(id) => link({ metric: id })} />
      <CountryFilter value={country} />
      {metric === "kd" && <p className="text-sm text-muted">K/D needs at least {MIN_KD_MATCHES} matches in the period.</p>}
      {rows.length > 0 ? (
        <LeaderList rows={rows} metric={metric} />
      ) : (
        <p className="rounded-xl border border-line bg-surface p-4 text-muted">No players match these filters yet.</p>
      )}
      <p className="text-center text-xs text-muted">Top 50. Stats are entered by players.</p>
    </div>
  );
}
