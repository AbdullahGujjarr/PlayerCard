import Link from "next/link";
import { UidSearch } from "@/components/UidSearch";

export default function PlayerNotFound() {
  return (
    <div className="space-y-5">
      <h1 className="num text-3xl font-bold">No player with that UID</h1>
      <p className="text-muted">They may not have made a card yet. Check the number and search again.</p>
      <UidSearch />
      <Link href="/register" className="btn btn-quiet w-full">
        Create your own card
      </Link>
    </div>
  );
}
