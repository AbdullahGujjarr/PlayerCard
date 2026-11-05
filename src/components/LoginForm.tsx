"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "./client-api";

export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { uid } = await postJson<{ uid: string }>(
        "/api/auth/login",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      router.push(next ?? `/p/${uid}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block font-medium">
          In-game username
        </label>
        <input id="username" name="username" required autoComplete="username" className="field" />
      </div>
      <div>
        <label htmlFor="uid" className="mb-1.5 block font-medium">
          Character UID
        </label>
        <input id="uid" name="uid" required inputMode="numeric" autoComplete="off" className="field num text-lg" />
      </div>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Logging in..." : "Log in"}
      </button>
      <p className="text-center text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-accent">
          Create your card
        </Link>
      </p>
    </form>
  );
}
