import { ObjectId, type Document, type WithId } from "mongodb";
import { matches, players } from "./db";
import type {
  ChartBucket,
  ChartRange,
  LeaderMetric,
  LeaderPeriod,
  LeaderRow,
  Match,
  MatchView,
  Player,
  Totals,
} from "./types";

export const MIN_KD_MATCHES = 5;
export const HISTORY_PAGE = 10;

export const getPlayer = async (uid: string) => (await players()).findOne({ uid });

// K/D follows the in-game meaning: kills per match the player did not win.
const kdOf = (kills: number, matchCount: number, wins: number) =>
  matchCount === 0 ? 0 : kills / Math.max(1, matchCount - wins);

export async function getTotals(uid: string): Promise<Totals> {
  const [row] = await (await matches())
    .aggregate([
      { $match: { uid } },
      {
        $group: {
          _id: null,
          matches: { $sum: 1 },
          kills: { $sum: "$kills" },
          damage: { $sum: "$damage" },
          minutes: { $sum: "$survivalMin" },
          wins: { $sum: { $cond: [{ $eq: ["$placement", 1] }, 1, 0] } },
        },
      },
    ])
    .toArray();
  const t = { matches: 0, kills: 0, damage: 0, minutes: 0, wins: 0, ...row };
  return {
    matches: t.matches,
    kills: t.kills,
    damage: t.damage,
    minutes: t.minutes,
    wins: t.wins,
    kd: kdOf(t.kills, t.matches, t.wins),
    avgKills: t.matches ? t.kills / t.matches : 0,
    avgDamage: t.matches ? t.damage / t.matches : 0,
  };
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function bucketsFor(range: ChartRange, today: string) {
  const end = new Date(`${today}T00:00:00Z`);
  const out: { key: string; label: string }[] = [];
  if (range === "year") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1));
      out.push({
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      });
    }
    return out;
  }
  const days = range === "week" ? 7 : 30;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000);
    out.push({
      key: isoDay(d),
      label:
        range === "week"
          ? d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
          : d.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" }),
    });
  }
  return out;
}

export async function getChart(uid: string, range: ChartRange, today: string): Promise<ChartBucket[]> {
  const buckets = bucketsFor(range, today);
  const keyLength = range === "year" ? 7 : 10;
  const first = range === "year" ? `${buckets[0].key}-01` : buckets[0].key;
  const rows = await (await matches())
    .aggregate([
      { $match: { uid, playedOn: { $gte: first, $lte: today } } },
      {
        $group: {
          _id: { $substrCP: ["$playedOn", 0, keyLength] },
          matches: { $sum: 1 },
          kills: { $sum: "$kills" },
          damage: { $sum: "$damage" },
          minutes: { $sum: "$survivalMin" },
        },
      },
    ])
    .toArray();
  const byKey = new Map(rows.map((r) => [r._id as string, r]));
  return buckets.map((b) => {
    const r = byKey.get(b.key);
    return {
      ...b,
      matches: r?.matches ?? 0,
      kills: r?.kills ?? 0,
      damage: r?.damage ?? 0,
      minutes: r?.minutes ?? 0,
    };
  });
}

const toView = (m: WithId<Match>): MatchView => ({
  id: m._id.toString(),
  playedOn: m.playedOn,
  kills: m.kills,
  damage: m.damage,
  survivalMin: m.survivalMin,
  placement: m.placement,
  screenshotUrl: m.screenshotUrl,
});

/** Newest first, one page at a time. */
export async function getHistory(uid: string, skip = 0) {
  const rows = await (await matches())
    .find({ uid })
    .sort({ playedOn: -1, _id: -1 })
    .skip(skip)
    .limit(HISTORY_PAGE + 1)
    .toArray();
  return { items: rows.slice(0, HISTORY_PAGE).map(toView), hasMore: rows.length > HISTORY_PAGE };
}

export async function deleteMatch(id: string, uid: string) {
  if (!ObjectId.isValid(id)) return false;
  const { deletedCount } = await (await matches()).deleteOne({ _id: new ObjectId(id), uid });
  return deletedCount === 1;
}

export async function getLeaderboard(
  period: LeaderPeriod,
  metric: LeaderMetric,
  country: string | null,
  limit = 50,
): Promise<LeaderRow[]> {
  const pipeline: Document[] = [];
  if (period !== "all") {
    const days = period === "week" ? 7 : 30;
    const from = isoDay(new Date(Date.now() - (days - 1) * 86400000));
    pipeline.push({ $match: { playedOn: { $gte: from } } });
  }
  pipeline.push(
    {
      $group: {
        _id: "$uid",
        matches: { $sum: 1 },
        kills: { $sum: "$kills" },
        damage: { $sum: "$damage" },
        wins: { $sum: { $cond: [{ $eq: ["$placement", 1] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        kd: { $divide: ["$kills", { $max: [1, { $subtract: ["$matches", "$wins"] }] }] },
      },
    },
  );
  // A single lucky match should not top the K/D board.
  if (metric === "kd") pipeline.push({ $match: { matches: { $gte: MIN_KD_MATCHES } } });

  const sort = { $sort: { [metric]: -1, _id: 1 } };
  const join = [
    { $lookup: { from: "players", localField: "_id", foreignField: "uid", as: "player" } },
    { $unwind: "$player" },
  ];
  if (country) {
    pipeline.push(...join, { $match: { "player.country": country } }, sort, { $limit: limit });
  } else {
    pipeline.push(sort, { $limit: limit }, ...join);
  }

  const rows = await (await matches()).aggregate(pipeline).toArray();
  return rows.map((r) => {
    const p = r.player as Player;
    return {
      uid: p.uid,
      username: p.username,
      country: p.country,
      avatarUrl: p.avatarUrl,
      matches: r.matches,
      kills: r.kills,
      damage: r.damage,
      kd: r.kd,
    };
  });
}
