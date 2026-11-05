import { avatarUrl } from "@/lib/cloudinary-url";

export function Avatar({ url, name, size }: { url: string | null; name: string; size: number }) {
  const box = { width: size, height: size };
  if (url) {
    return <img src={avatarUrl(url, size * 3)} alt="" style={box} className="shrink-0 rounded-lg object-cover" />;
  }
  return (
    <span style={{ ...box, fontSize: size * 0.48 }} aria-hidden className="num flex shrink-0 items-center justify-center rounded-lg bg-raised font-bold text-accent">
      {[...name][0]?.toUpperCase()}
    </span>
  );
}
