import { NextResponse } from "next/server";

export const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
