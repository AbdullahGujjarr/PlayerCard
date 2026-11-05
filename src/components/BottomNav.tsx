"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icon = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.5-4.5",
  ranks: "M8 21V11H3v10h5Zm6.5 0V4h-5v17h5ZM21 21v-7h-5v7h5Z",
  plus: "M12 5v14M5 12h14",
  card: "M4 5h16v14H4V5Zm4 10h2m-2-3h2m4-3h3m-3 3h3m-3 3h3M8 9h2",
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function BottomNav({ uid }: { uid: string | null }) {
  const pathname = usePathname();
  const myCard = uid ? `/p/${uid}` : "/login";
  const items = [
    { href: "/", label: "Search", d: icon.search, active: pathname === "/" },
    { href: "/leaderboard", label: "Ranks", d: icon.ranks, active: pathname === "/leaderboard" },
    { href: uid ? "/upload" : "/login?next=/upload", label: "Add match", d: icon.plus, active: pathname === "/upload" },
    { href: myCard, label: "My card", d: icon.card, active: pathname === myCard || pathname === "/edit" },
  ];
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[max(env(safe-area-inset-bottom),var(--badge-space,0px))]">
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => (
          <li key={item.label} className="flex-1">
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${item.active ? "text-accent" : "text-muted"}`}
            >
              <Icon d={item.d} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
