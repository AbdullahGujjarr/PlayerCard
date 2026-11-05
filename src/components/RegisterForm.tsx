"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson, shrinkImage, uploadImage } from "./client-api";
import { CountryField, PhotoField, PlayingSinceField } from "./ProfileFields";

export function RegisterForm() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { uid } = await postJson<{ uid: string }>("/api/auth/register", values);
      if (photo) {
        // The account exists now; a failed photo should not block the player.
        try {
          const avatarUrl = await uploadImage(await shrinkImage(photo, 800), "avatar");
          await postJson("/api/me", { avatarUrl }, "PATCH");
        } catch {}
      }
      router.push(`/p/${uid}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
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
      <div>
        <label htmlFor="username" className="mb-1.5 block font-medium">
          In-game username
        </label>
        <input id="username" name="username" required minLength={2} maxLength={24} autoComplete="username" className="field" />
      </div>
      <div>
        <label htmlFor="uid" className="mb-1.5 block font-medium">
          Character UID
        </label>
        <input id="uid" name="uid" required inputMode="numeric" pattern="\d{5,15}" title="5 to 15 digits" autoComplete="off" className="field num text-lg" />
        <p className="mt-1 text-sm text-muted">Find it on your in-game profile page.</p>
      </div>
      <CountryField />
      <PlayingSinceField />
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Creating your card..." : "Create my card"}
      </button>
      <p className="text-center text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Log in
        </Link>
      </p>
    </form>
  );
}
