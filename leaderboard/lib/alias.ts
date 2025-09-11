import fs from "node:fs";
import path from "node:path";

const EMOJI_REGEX =
  /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
const PUNCT_REGEX = /[^\p{L}\p{N}\s]/gu;
const MULTISPACE_REGEX = /\s+/g;

function stripCommonTags(s: string) {
  return s.replace(/\((?:ny|new|alt)\)/gi, "").trim();
}

export function normalizeName(raw: string): string {
  if (!raw) return "unknown";
  const s1 = stripCommonTags(raw);
  const s2 = s1.replace(EMOJI_REGEX, "");
  const s3 = s2.replace(PUNCT_REGEX, "");
  const s4 = s3.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  let out = s4.toLowerCase().trim().replace(MULTISPACE_REGEX, " ");
  // Fallback for emoji-only or fully stripped
  if (!out) {
    const cp = Array.from(raw)[0]?.codePointAt(0) ?? 0;
    out = `emoji_${cp}`;
  }
  return out;
}

export type PeopleAliases = {
  people: Array<{
    name: string; // canonical
    aliases: string[]; // raw aliases (any format)
  }>;
};

export type AliasIndex = {
  toCanonical: Record<string, string>; // normalized -> canonical
  canonicalSet: Set<string>;
};

export function loadAliasIndex(): AliasIndex {
  const file = path.join(process.cwd(), "data", "aliases.json");
  if (!fs.existsSync(file)) return { toCanonical: {}, canonicalSet: new Set() };
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as PeopleAliases;

  const toCanonical: Record<string, string> = {};
  const canonicalSet = new Set<string>();

  for (const p of parsed.people) {
    const canonical = p.name;
    canonicalSet.add(canonical);
    // map canonical itself
    toCanonical[normalizeName(canonical)] = canonical;
    // map all aliases
    for (const a of p.aliases ?? []) {
      toCanonical[normalizeName(a)] = canonical;
    }
  }
  return { toCanonical, canonicalSet };
}

export function resolveName(
  raw: string,
  idx: AliasIndex
): { canonical: string; normalized: string; known: boolean } {
  const n = normalizeName(raw);
  const can = idx.toCanonical[n];
  if (can) return { canonical: can, normalized: n, known: true };
  // if the normalized string is *itself* a canonical (user typed exact canonical)
  if (idx.canonicalSet.has(raw))
    return { canonical: raw, normalized: n, known: true };
  return { canonical: raw, normalized: n, known: false };
}

const unmappedAliases = new Set<string>();

export function storeUnmappedAlias(raw: string) {
  unmappedAliases.add(raw);
}

export function getUnmappedAliases(): string[] {
  return Array.from(unmappedAliases).sort();
}
