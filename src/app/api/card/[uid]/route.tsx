import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { fail } from "@/lib/api";
import { APP_NAME } from "@/lib/brand";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import { countryName } from "@/lib/countries";
import { formatDuration, formatExperience, formatNumber } from "@/lib/format";
import { getPlayer, getTotals } from "@/lib/stats";

const C = { bg: "#0F1210", panel: "#1A1F1B", line: "#333B34", ink: "#F2F1EA", muted: "#A9AFA5", accent: "#E8A200" };

const fontFile = (name: string) => readFile(path.join(process.cwd(), "src/assets/fonts", name));

function Stat({ label, value, size }: { label: string; value: string; size: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, background: C.panel, padding: size * 0.32, borderTop: `4px solid ${C.line}` }}>
      <div style={{ fontSize: size, lineHeight: 1, fontWeight: 700, color: C.ink }}>{value}</div>
      <div style={{ fontSize: size * 0.42, marginTop: size * 0.14, fontWeight: 600, color: C.muted }}>{label}</div>
    </div>
  );
}

export async function GET(request: Request, ctx: RouteContext<"/api/card/[uid]">) {
  const { uid } = await ctx.params;
  const player = await getPlayer(uid);
  if (!player) return fail("Player not found.", 404);
  const totals = await getTotals(uid);
  const wide = new URL(request.url).searchParams.get("format") === "og";

  const width = wide ? 1200 : 1080;
  const height = wide ? 630 : 1350;
  const photoSize = wide ? 190 : 300;
  const statSize = wide ? 52 : 100;
  const smallSize = wide ? 38 : 72;
  const initial = [...player.username][0]?.toUpperCase() ?? "?";

  const photo = player.avatarUrl ? (
    <img
      alt=""
      src={cloudinaryUrl(player.avatarUrl, `w_${photoSize * 2},h_${photoSize * 2},c_fill,g_auto,f_jpg,q_85`)}
      width={photoSize}
      height={photoSize}
      style={{ objectFit: "cover", border: `4px solid ${C.accent}` }}
    />
  ) : (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: photoSize, height: photoSize, background: C.panel, border: `4px solid ${C.accent}`, color: C.accent, fontSize: photoSize * 0.5, fontWeight: 700 }}>
      {initial}
    </div>
  );

  const row = { display: "flex", ...(wide ? {} : { flex: 1 }), gap: wide ? 12 : 16, marginTop: wide ? 12 : 16 };

  const image = (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.bg, padding: wide ? 44 : 64, fontFamily: "Barlow Condensed" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: wide ? 30 : 40, fontWeight: 700, color: C.accent, letterSpacing: 2 }}>
        <div>{APP_NAME.toUpperCase()}</div>
        <div style={{ color: C.muted, fontWeight: 600, letterSpacing: 0 }}>PUBG Mobile player card</div>
      </div>
      <div style={{ display: "flex", marginTop: wide ? 26 : 56, marginBottom: wide ? 14 : 44 }}>
        {photo}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: wide ? 36 : 44, justifyContent: "center", minWidth: 0 }}>
          <div style={{ fontSize: wide ? 72 : 92, lineHeight: 1.05, fontWeight: 700, color: C.ink }}>{player.username}</div>
          <div style={{ fontSize: wide ? 32 : 42, marginTop: 10, fontWeight: 600, color: C.accent }}>{`UID ${player.uid}`}</div>
          <div style={{ fontSize: wide ? 30 : 40, marginTop: 6, fontWeight: 600, color: C.muted }}>{countryName(player.country)}</div>
        </div>
      </div>
      <div style={row}>
        <Stat label="Matches" value={formatNumber(totals.matches)} size={statSize} />
        <Stat label="Kills" value={formatNumber(totals.kills)} size={statSize} />
        <Stat label="Damage" value={formatNumber(totals.damage)} size={statSize} />
      </div>
      <div style={row}>
        <Stat label="Wins" value={formatNumber(totals.wins)} size={smallSize} />
        <Stat label="K/D" value={totals.kd.toFixed(2)} size={smallSize} />
        <Stat label="Time played" value={formatDuration(totals.minutes)} size={smallSize} />
      </div>
      {!wide && (
        <div style={row}>
          <Stat label="Avg kills" value={totals.avgKills.toFixed(1)} size={smallSize} />
          <Stat label="Avg damage" value={formatNumber(totals.avgDamage)} size={smallSize} />
          <Stat label="Experience" value={formatExperience(player.playingSince)} size={smallSize} />
        </div>
      )}
      {!wide && (
        <div style={{ display: "flex", marginTop: 28, fontSize: 34, fontWeight: 600, color: C.muted }}>
          Player-reported stats with screenshot proof
        </div>
      )}
    </div>
  );

  const [semibold, bold, symbols] = await Promise.all([
    fontFile("barlow-condensed-latin-600-normal.woff"),
    fontFile("barlow-condensed-latin-700-normal.woff"),
    fontFile("noto-sans-symbols-2-symbols-400-normal.woff"),
  ]);
  return new ImageResponse(image, {
    width,
    height,
    fonts: [
      { name: "Barlow Condensed", data: semibold, weight: 600, style: "normal" },
      { name: "Barlow Condensed", data: bold, weight: 700, style: "normal" },
      // Decorated in-game names often use symbols such as a star.
      { name: "Noto Sans Symbols 2", data: symbols, weight: 400, style: "normal" },
    ],
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
  });
}
