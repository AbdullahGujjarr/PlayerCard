import { countryName } from "@/lib/countries";
import { formatDuration, formatExperience, formatNumber } from "@/lib/format";
import type { Player, Totals } from "@/lib/types";
import { Avatar } from "./Avatar";
import { CopyUid } from "./CopyUid";

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="min-w-0 bg-surface px-3 py-2.5">
      <dd className={`num font-bold ${big ? "text-3xl" : "text-2xl"} leading-none`}>{value}</dd>
      <dt className="mt-1 text-sm text-muted">{label}</dt>
    </div>
  );
}

export function PlayerCard({ player, totals }: { player: Player; totals: Totals }) {
  return (
    <section aria-label={`${player.username} player card`} className="overflow-hidden rounded-xl border border-line bg-raised">
      <div className="flex items-center gap-4 border-t-4 border-accent p-4">
        <Avatar url={player.avatarUrl} name={player.username} size={96} />
        <div className="min-w-0">
          <h1 className="num truncate text-3xl leading-tight font-bold">{player.username}</h1>
          <CopyUid uid={player.uid} />
          <p className="truncate text-sm text-muted">{countryName(player.country)}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-px border-t border-line bg-line">
        <Stat big label="Matches" value={formatNumber(totals.matches)} />
        <Stat big label="Kills" value={formatNumber(totals.kills)} />
        <Stat big label="Damage" value={formatNumber(totals.damage)} />
        <Stat label="Wins" value={formatNumber(totals.wins)} />
        <Stat label="K/D" value={totals.kd.toFixed(2)} />
        <Stat label="Time played" value={formatDuration(totals.minutes)} />
        <Stat label="Avg kills" value={totals.avgKills.toFixed(1)} />
        <Stat label="Avg damage" value={formatNumber(totals.avgDamage)} />
        <Stat label="Experience" value={formatExperience(player.playingSince)} />
      </dl>
    </section>
  );
}
