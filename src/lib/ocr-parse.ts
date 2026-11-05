export type ParsedMatch = {
  kills?: number;
  damage?: number;
  survivalMin?: number;
  placement?: number;
};

const KILL_LABEL = /\b(eliminations?|elims?|finishes|kills?)\b/i;
const DAMAGE_LABEL = /\bdamage(\s+dealt)?\b/i;
const TIME_LABEL = /\b(time\s+survived|survived|survival(\s+time)?)\b/i;
const ANY_LABEL = new RegExp(
  `${KILL_LABEL.source}|${DAMAGE_LABEL.source}|${TIME_LABEL.source}|\\b(assists?|rescues?|rating|knocks?|headshots?)\\b`,
  "gi",
);

function parseTime(text: string): number | undefined {
  const clock = text.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (clock) return Math.round((Number(clock[1]) + Number(clock[2]) / 60) * 10) / 10;
  const plain = text.match(/\d{1,2}(?:\.\d+)?/);
  return plain ? Number(plain[0]) : undefined;
}

const parseCount = (text: string) => {
  const found = text.match(/\d[\d,]*(?:\.\d+)?/);
  return found ? Math.round(Number(found[0].replace(/,/g, ""))) : undefined;
};

/**
 * Pulls match numbers out of OCR text from a result screen. Handles both
 * "Damage 432" lines and a header row with the values on the line below.
 * Only returns values it found and that are plausible; the player confirms them.
 */
export function parseMatchText(text: string): ParsedMatch {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result: ParsedMatch = {};

  const assign = (label: string, value: string) => {
    if (KILL_LABEL.test(label) && result.kills === undefined) {
      const n = parseCount(value);
      if (n !== undefined && n <= 99) result.kills = n;
    } else if (DAMAGE_LABEL.test(label) && result.damage === undefined) {
      const n = parseCount(value);
      if (n !== undefined && n <= 20000) result.damage = n;
    } else if (TIME_LABEL.test(label) && result.survivalMin === undefined) {
      const n = parseTime(value);
      if (n !== undefined && n <= 60) result.survivalMin = n;
    }
  };

  lines.forEach((line, i) => {
    const labels = [...line.matchAll(ANY_LABEL)];
    if (labels.length === 0) return;
    const next = lines[i + 1] ?? "";

    if (labels.length > 1 && !/\d/.test(line)) {
      // Header row: one value per label on the following line.
      const values = next.match(/\d[\d,:.]*/g) ?? [];
      labels.forEach((label, index) => values[index] && assign(label[0], values[index]));
      return;
    }
    labels.forEach((label, index) => {
      const start = label.index + label[0].length;
      const end = labels[index + 1]?.index ?? line.length;
      const sameLine = line.slice(start, end);
      if (/\d/.test(sameLine)) assign(label[0], sameLine);
      else if (index === labels.length - 1) assign(label[0], next);
    });
  });

  const rank = text.match(/#\s*(\d{1,3})(?!\d)/) ?? text.match(/\brank\D{0,3}(\d{1,3})\b/i);
  if (rank && Number(rank[1]) >= 1 && Number(rank[1]) <= 100) result.placement = Number(rank[1]);
  else if (/winner\s+winner|chicken\s+dinner/i.test(text)) result.placement = 1;

  return result;
}
