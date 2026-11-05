import { COUNTRIES } from "@/lib/countries";

export function CountryField({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label htmlFor="country" className="mb-1.5 block font-medium">
        Country
      </label>
      <select id="country" name="country" required className="field" defaultValue={defaultValue ?? ""}>
        <option value="" disabled>
          Choose your country
        </option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PlayingSinceField({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label htmlFor="playingSince" className="mb-1.5 block font-medium">
        Playing since
      </label>
      <input id="playingSince" name="playingSince" type="month" required min="2018-01" className="field" defaultValue={defaultValue} />
      <p className="mt-1 text-sm text-muted">Your experience on the card is counted from this month.</p>
    </div>
  );
}

export function PhotoField({
  preview,
  onPick,
}: {
  preview: string | null;
  onPick: (file: File) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <img src={preview} alt="Your photo" className="size-20 rounded-lg object-cover" />
      ) : (
        <span className="flex size-20 items-center justify-center rounded-lg border border-dashed border-line text-sm text-muted">
          Photo
        </span>
      )}
      <label className="btn btn-quiet cursor-pointer focus-within:outline-2 focus-within:outline-accent">
        {preview ? "Change photo" : "Choose photo"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
          }}
        />
      </label>
    </div>
  );
}
