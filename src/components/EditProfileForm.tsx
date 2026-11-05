"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { avatarUrl as sizedAvatar } from "@/lib/cloudinary-url";
import { postJson, shrinkImage, uploadImage } from "./client-api";
import { CountryField, PhotoField, PlayingSinceField } from "./ProfileFields";

type Props = { uid: string; country: string; playingSince: string; avatarUrl: string | null };

export function EditProfileForm({ uid, country, playingSince, avatarUrl }: Props) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState(avatarUrl ? sizedAvatar(avatarUrl) : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (photo) values.avatarUrl = await uploadImage(await shrinkImage(photo, 800), "avatar");
      await postJson("/api/me", values, "PATCH");
      router.push(`/p/${uid}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function logOut() {
    await postJson("/api/auth/logout", {});
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PhotoField
        preview={preview}
        onPick={(file) => {
          setPhoto(file);
          setPreview(URL.createObjectURL(file));
        }}
      />
      <CountryField defaultValue={country} />
      <PlayingSinceField defaultValue={playingSince} />
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Saving..." : "Save changes"}
      </button>
      <button type="button" onClick={logOut} className="btn btn-quiet w-full">
        Log out
      </button>
    </form>
  );
}
