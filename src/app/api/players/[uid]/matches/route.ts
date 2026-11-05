import { NextResponse } from "next/server";
import { getHistory } from "@/lib/stats";

export async function GET(request: Request, ctx: RouteContext<"/api/players/[uid]/matches">) {
  const { uid } = await ctx.params;
  const skip = Number(new URL(request.url).searchParams.get("skip"));
  return NextResponse.json(await getHistory(uid, Number.isInteger(skip) && skip > 0 ? skip : 0));
}
