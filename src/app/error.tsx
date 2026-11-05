"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="num text-3xl font-bold">Something went wrong</h1>
      <p className="text-muted">We couldn&apos;t load this page. Check your connection and try again.</p>
      <button className="btn btn-primary w-full" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
