import { Db, MongoClient } from "mongodb";
import type { Match, Player } from "./types";

const cache = globalThis as unknown as { __dropcardDb?: Promise<Db> };

async function connect(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("YOUR_DB_PASSWORD")) {
    throw new Error("MONGODB_URI is not set. Add your Atlas password to .env.local.");
  }
  const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect();
  const db = client.db(process.env.MONGODB_DB || "dropcard");
  await Promise.all([
    db.collection<Player>("players").createIndex({ uid: 1 }, { unique: true }),
    db.collection<Match>("matches").createIndex({ uid: 1, playedOn: -1, _id: -1 }),
    db.collection<Match>("matches").createIndex({ playedOn: 1 }),
  ]);
  return db;
}

export function getDb(): Promise<Db> {
  if (!cache.__dropcardDb) {
    cache.__dropcardDb = connect().catch((error) => {
      cache.__dropcardDb = undefined; // let the next request retry
      throw error;
    });
  }
  return cache.__dropcardDb;
}

export const players = async () => (await getDb()).collection<Player>("players");
export const matches = async () => (await getDb()).collection<Match>("matches");
