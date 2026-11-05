import Link from "next/link";
import { countryName } from "@/lib/countries";
import { formatNumber } from "@/lib/format";
import type { LeaderMetric, LeaderRow } from "@/lib/types";
import { Avatar } from "./Avatar";

const value = (row: LeaderRow, metric: LeaderMetric) =>
  metric === "kd" ? row.kd.toFixed(2) : formatNumber(row[metric]);

export const METRIC_LABEL: Record<LeaderMetric, string> = { kills: "kills", damage: "damage", kd: "K/D" };

export function LeaderList({ rows, metric }: { rows: LeaderRow[]; metric: LeaderMetric }) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {rows.map((row, index) => (
        <li key={row.uid}>
          <Link href={`/p/${row.uid}`} className="flex min-h-16 items-center gap-3 px-3 py-2">
            <span className={`num w-7 shrink-0 text-center text-xl font-bold ${index < 3 ? "text-accent" : "text-muted"}`}>{index + 1}</span>
            <Avatar url={row.avatarUrl} name={row.username} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{row.username}</span>
              <span className="block truncate text-sm text-muted">
                {formatNumber(row.matches)} {row.matches === 1 ? "match" : "matches"} · {countryName(row.country)}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="num block text-2xl leading-none font-bold">{value(row, metric)}</span>
              <span className="text-xs text-muted">{METRIC_LABEL[metric]}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
