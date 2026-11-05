import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditProfileForm } from "@/components/EditProfileForm";
import { getSessionUid } from "@/lib/session";
import { getPlayer } from "@/lib/stats";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditPage() {
  const uid = await getSessionUid();
  const player = uid ? await getPlayer(uid) : null;
  if (!player) redirect("/login");
  return (
    <div className="space-y-5">
      <h1 className="num text-3xl font-bold">Edit profile</h1>
      <EditProfileForm uid={player.uid} country={player.country} playingSince={player.playingSince} avatarUrl={player.avatarUrl} />
    </div>
  );
}
