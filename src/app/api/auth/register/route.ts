import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { fail, readJson } from "@/lib/api";
import { players } from "@/lib/db";
import { startSession } from "@/lib/session";
import { firstIssue, registerSchema, usernameKey } from "@/lib/validate";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { username, uid, country, playingSince } = parsed.data;
  try {
    await (await players()).insertOne({
      uid,
      username,
      usernameKey: usernameKey(username),
      country,
      playingSince,
      avatarUrl: null,
      createdAt: new Date(),
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return fail("This UID is already registered. Log in instead.", 409);
    }
    throw error;
  }
  await startSession(uid);
  return NextResponse.json({ uid });
}
