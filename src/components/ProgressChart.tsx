"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDuration, formatNumber, localToday } from "@/lib/format";
import type { ChartBucket, ChartRange } from "@/lib/types";

type Metric = "kills" | "damage" | "matches" | "minutes";

const RANGES: { id: ChartRange; label: string; period: string }[] = [
  { id: "week", label: "Week", period: "Last 7 days" },
  { id: "month", label: "Month", period: "Last 30 days" },
  { id: "year", label: "Year", period: "Last 12 months" },
];

const METRICS: { id: Metric; label: string }[] = [
  { id: "kills", label: "Kills" },
  { id: "damage", label: "Damage" },
  { id: "matches", label: "Matches" },
  { id: "minutes", label: "Time" },
];

const show = (metric: Metric, value: number) =>
  metric === "minutes" ? formatDuration(value) : formatNumber(value);

/** Rounds the axis top up to a clean number so gridlines read well. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-lg bg-bg p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
          className={`min-h-10 flex-1 rounded-md text-sm font-semibold ${o.id === value ? "bg-raised text-ink" : "text-muted"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressChart({ uid }: { uid: string }) {
  const [range, setRange] = useState<ChartRange>("week");
  const [metric, setMetric] = useState<Metric>("kills");
  const [data, setData] = useState<Partial<Record<ChartRange, ChartBucket[]>>>({});
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const buckets = data[range];

  useEffect(() => {
    if (data[range]) return;
    let active = true;
    fetch(`/api/players/${uid}/chart?range=${range}&today=${localToday()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => active && setData((d) => ({ ...d, [range]: json.buckets })))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [uid, range, data]);

  const { total, top } = useMemo(() => {
    const values = (buckets ?? []).map((b) => b[metric]);
    return { total: values.reduce((a, b) => a + b, 0), top: niceMax(Math.max(0, ...values)) };
  }, [buckets, metric]);

  const period = RANGES.find((r) => r.id === range)!.period;
  const metricLabel = METRICS.find((m) => m.id === metric)!.label;
  const picked = selected !== null ? buckets?.[selected] : undefined;
  const labelEvery = range === "month" ? 7 : 1;

  return (
    <section aria-labelledby="progress-title" className="rounded-xl border border-line bg-surface p-4">
      <h2 id="progress-title" className="num mb-3 text-2xl font-bold">
        Progress
      </h2>
      <div className="space-y-2">
        <Segmented label="Time range" options={RANGES} value={range} onChange={(r) => { setRange(r); setSelected(null); }} />
        <Segmented label="Stat" options={METRICS} value={metric} onChange={setMetric} />
      </div>

      <div className="mt-4 flex min-h-14 items-end justify-between gap-3" aria-live="polite">
        <div>
          <p className="num text-4xl leading-none font-bold">{show(metric, picked ? picked[metric] : total)}</p>
          <p className="mt-1 text-sm text-muted">
            {metricLabel}, {picked ? picked.label : period.toLowerCase()}
          </p>
        </div>
      </div>

      {failed && !buckets && <p className="mt-4 text-danger">Couldn&apos;t load this chart. Refresh to try again.</p>}
      {!failed && !buckets && <div className="mt-4 h-44 animate-pulse rounded-lg bg-raised" aria-label="Loading chart" />}

      {buckets && (
        <>
          <div className="relative mt-4 h-44">
            {[1, 0.5].map((f) => (
              <div key={f} className="absolute inset-x-0 border-t border-line" style={{ top: `${(1 - f) * 100}%` }}>
                <span className="num absolute top-0.5 right-0 bg-surface pl-1 text-xs text-muted">{show(metric, top * f)}</span>
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 border-t border-muted" />
            <div className="absolute inset-0 flex items-end gap-0.5 pr-9">
              {buckets.map((b, i) => (
                <button
                  key={b.key}
                  type="button"
                  aria-label={`${b.label}: ${show(metric, b[metric])}`}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(selected === i ? null : i)}
                  onMouseEnter={() => setSelected(i)}
                  className="flex h-full min-w-0 flex-1 items-end"
                >
                  {b[metric] > 0 && (
                    <span
                      className={`block w-full rounded-t ${selected === null || selected === i ? "bg-accent" : "bg-accent/45"}`}
                      style={{ height: `${Math.max(2, (b[metric] / top) * 100)}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-1 flex gap-0.5 pr-9" aria-hidden>
            {buckets.map((b, i) => (
              <span key={b.key} className="relative h-4 min-w-0 flex-1 text-xs text-muted">
                {(buckets.length - 1 - i) % labelEvery === 0 && (
                  <span className={`absolute top-0 whitespace-nowrap ${range === "month" ? "right-0" : "inset-x-0 text-center"}`}>
                    {range === "year" ? b.label[0] : range === "week" ? b.label.slice(0, 2) : b.label}
                  </span>
                )}
              </span>
            ))}
          </div>
          {total === 0 && <p className="mt-2 text-sm text-muted">No matches in this period.</p>}
          <details className="mt-3 text-sm">
            <summary className="min-h-8 cursor-pointer text-muted">See as a table</summary>
            <table className="mt-2 w-full text-left">
              <thead className="text-muted">
                <tr>
                  <th className="py-1 font-medium">Period</th>
                  <th className="py-1 text-right font-medium">Matches</th>
                  <th className="py-1 text-right font-medium">Kills</th>
                  <th className="py-1 text-right font-medium">Damage</th>
                  <th className="py-1 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {buckets.filter((b) => b.matches > 0).map((b) => (
                  <tr key={b.key} className="border-t border-line">
                    <td className="py-1">{b.label}</td>
                    <td className="py-1 text-right">{formatNumber(b.matches)}</td>
                    <td className="py-1 text-right">{formatNumber(b.kills)}</td>
                    <td className="py-1 text-right">{formatNumber(b.damage)}</td>
                    <td className="py-1 text-right">{formatDuration(b.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}
