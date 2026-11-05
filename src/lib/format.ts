export const formatNumber = (n: number) => Math.round(n).toLocaleString("en-US");

export function formatDuration(minutes: number) {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${formatNumber(h)}h` : `${formatNumber(h)}h ${m}m`;
}

/** "3y 2m" of experience from a YYYY-MM start month. */
export function formatExperience(playingSince: string, now = new Date()) {
  const [year, month] = playingSince.split("-").map(Number);
  const months = Math.max(0, (now.getFullYear() - year) * 12 + now.getMonth() + 1 - month);
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}m`;
  return m === 0 ? `${y}y` : `${y}y ${m}m`;
}

export function formatDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Today as YYYY-MM-DD in the viewer's own time zone. */
export function localToday() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
