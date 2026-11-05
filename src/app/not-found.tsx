import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="num text-3xl font-bold">Page not found</h1>
      <Link href="/" className="btn btn-primary w-full">
        Back to search
      </Link>
    </div>
  );
}
