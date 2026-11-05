"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

export function CountryFilter({ value }: { value: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <div>
      <label htmlFor="country-filter" className="sr-only">
        Country
      </label>
      <select
        id="country-filter"
        className="field"
        value={value ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          if (e.target.value) params.set("country", e.target.value);
          else params.delete("country");
          router.replace(`${pathname}?${params}`, { scroll: false });
        }}
      >
        <option value="">All countries</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
