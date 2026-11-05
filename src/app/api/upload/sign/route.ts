import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { fail, readJson } from "@/lib/api";
import { getSessionUid } from "@/lib/session";
import { uploadFolder } from "@/lib/uploads";

// Phones upload straight to Cloudinary with this short-lived signature, so the
// API secret stays on the server and images never pass through our functions.
export async function POST(request: Request) {
  const uid = await getSessionUid();
  if (!uid) return fail("Log in first.", 401);
  const body = (await readJson(request)) as { kind?: string } | null;
  if (body?.kind !== "avatar" && body?.kind !== "screenshot") return fail("Unknown upload type.");

  const params = {
    timestamp: Math.round(Date.now() / 1000),
    folder: uploadFolder(uid, body.kind),
    allowed_formats: "jpg,jpeg,png,webp",
  };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return NextResponse.json({
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
