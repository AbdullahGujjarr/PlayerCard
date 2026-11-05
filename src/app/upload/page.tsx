import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/UploadForm";
import { getSessionUid } from "@/lib/session";

export const metadata: Metadata = { title: "Add match" };

export default async function UploadPage() {
  const uid = await getSessionUid();
  if (!uid) redirect("/login?next=/upload");
  return (
    <div className="space-y-5">
      <h1 className="num text-3xl font-bold">Add match</h1>
      <UploadForm uid={uid} />
    </div>
  );
}
