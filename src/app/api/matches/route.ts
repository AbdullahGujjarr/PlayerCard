import { NextResponse } from "next/server";
import { fail, readJson } from "@/lib/api";
import { matches } from "@/lib/db";
import { getSessionUid } from "@/lib/session";
import { isOwnUpload } from "@/lib/uploads";
import { firstIssue, matchSchema } from "@/lib/validate";

export async function POST(request: Request) {
  const uid = await getSessionUid();
  if (!uid) return fail("Log in first.", 401);
  const parsed = matchSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const data = parsed.data;
  if (!isOwnUpload(data.screenshotUrl, uid, "screenshot")) return fail("Upload a screenshot first.");
  // One day of slack covers players in time zones ahead of the server.
  const latest = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (data.playedOn > latest) return fail("The match date can't be in the future.");
  await (await matches()).insertOne({ ...data, uid, createdAt: new Date() });
  return NextResponse.json({ ok: true });
}
