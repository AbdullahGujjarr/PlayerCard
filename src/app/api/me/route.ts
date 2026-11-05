import { NextResponse } from "next/server";
import { fail, readJson } from "@/lib/api";
import { players } from "@/lib/db";
import { getSessionUid } from "@/lib/session";
import { isOwnUpload } from "@/lib/uploads";
import { firstIssue, profileSchema } from "@/lib/validate";

export async function PATCH(request: Request) {
  const uid = await getSessionUid();
  if (!uid) return fail("Log in first.", 401);
  const parsed = profileSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { avatarUrl } = parsed.data;
  if (avatarUrl && !isOwnUpload(avatarUrl, uid, "avatar")) return fail("Invalid image.");
  await (await players()).updateOne({ uid }, { $set: parsed.data });
  return NextResponse.json({ ok: true });
}
