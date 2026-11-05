"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UidSearch() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{5,15}$/.test(uid)) {
      setError("Enter the player's UID. It is 5 to 15 digits.");
      return;
    }
    router.push(`/p/${uid}`);
  }

  return (
    <form onSubmit={submit} role="search">
      <label htmlFor="uid-search" className="mb-2 block font-medium">
        Find a player by UID
      </label>
      <div className="flex gap-2">
        <input
          id="uid-search"
          className="field num min-w-0 flex-1 text-xl tracking-wider"
          inputMode="numeric"
          autoComplete="off"
          placeholder="5123456789"
          value={uid}
          aria-invalid={!!error}
          aria-describedby={error ? "uid-error" : undefined}
          onChange={(e) => {
            setUid(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </div>
      {error && (
        <p id="uid-error" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
