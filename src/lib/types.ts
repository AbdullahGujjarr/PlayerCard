export type Player = {
  uid: string;
  username: string;
  usernameKey: string;
  country: string;
  playingSince: string; // YYYY-MM
  avatarUrl: string | null;
  createdAt: Date;
};

export type Match = {
  uid: string;
  playedOn: string; // YYYY-MM-DD, the calendar day the player chose
  kills: number;
  damage: number;
  survivalMin: number;
  placement: number;
  screenshotUrl: string;
  createdAt: Date;
};

export type MatchView = Omit<Match, "createdAt" | "uid"> & { id: string };

export type Totals = {
  matches: number;
  kills: number;
  damage: number;
  minutes: number;
  wins: number;
  kd: number;
  avgKills: number;
  avgDamage: number;
};

export type ChartRange = "week" | "month" | "year";

export type ChartBucket = {
  key: string;
  label: string;
  matches: number;
  kills: number;
  damage: number;
  minutes: number;
};

export type LeaderPeriod = "week" | "month" | "all";
export type LeaderMetric = "kills" | "damage" | "kd";

export type LeaderRow = {
  uid: string;
  username: string;
  country: string;
  avatarUrl: string | null;
  matches: number;
  kills: number;
  damage: number;
  kd: number;
};
