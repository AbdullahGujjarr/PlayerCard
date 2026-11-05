import { NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { getChart } from "@/lib/stats";
import type { ChartRange } from "@/lib/types";

const RANGES: ChartRange[] = ["week", "month", "year"];

export async function GET(request: Request, ctx: RouteContext<"/api/players/[uid]/chart">) {
  const { uid } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") as ChartRange;
  if (!RANGES.includes(range)) return fail("Unknown range.");
  // The viewer's "today" keeps buckets right across time zones; ignore bad values.
  const day = searchParams.get("today") ?? "";
  const now = Date.now();
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Math.abs(new Date(`${day}T12:00:00Z`).getTime() - now) < 2 * 86400000;
  const today = valid ? day : new Date(now).toISOString().slice(0, 10);
  return NextResponse.json({ buckets: await getChart(uid, range, today) });
}
