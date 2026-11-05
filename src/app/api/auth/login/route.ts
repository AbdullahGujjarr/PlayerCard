import { NextResponse } from "next/server";
import { fail, readJson } from "@/lib/api";
import { players } from "@/lib/db";
import { startSession } from "@/lib/session";
import { firstIssue, loginSchema, usernameKey } from "@/lib/validate";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { username, uid } = parsed.data;
  const player = await (await players()).findOne({ uid, usernameKey: usernameKey(username) });
  if (!player) return fail("No player found with that username and UID.", 401);
  await startSession(uid);
  return NextResponse.json({ uid });
}
