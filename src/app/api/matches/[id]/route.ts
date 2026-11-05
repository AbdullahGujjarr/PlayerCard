import { NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { getSessionUid } from "@/lib/session";
import { deleteMatch } from "@/lib/stats";

export async function DELETE(_: Request, ctx: RouteContext<"/api/matches/[id]">) {
  const uid = await getSessionUid();
  if (!uid) return fail("Log in first.", 401);
  const { id } = await ctx.params;
  if (!(await deleteMatch(id, uid))) return fail("Match not found.", 404);
  return NextResponse.json({ ok: true });
}
