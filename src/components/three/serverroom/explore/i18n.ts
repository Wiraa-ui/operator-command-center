import { getExploreState } from "./store";

/**
 * i18n — the explore game's tiny bilingual layer (user mandate 2026-07-19:
 * a player-facing ID⇄EN toggle across the whole game).
 *
 * Design: no separate string-catalog file. Translations live inline at the
 * call site as `tr("teks id", "english text")` — one source of truth, the two
 * variants sitting next to each other so they can never drift into separate
 * files. The active language is a persisted game setting (store.settings.lang).
 *
 * - Frame-loop / non-React code: call `tr(id, en)` directly.
 * - React components: subscribe with `useExplore(s => s.settings.lang)` so the
 *   tree re-renders on toggle, then call `tr(id, en)` for the text itself.
 */

export type Lang = "id" | "en";

/** A phrase in both languages; resolve with `pick()` when a language is known. */
export interface Bi {
  id: string;
  en: string;
}

export function getLang(): Lang {
  return getExploreState().settings.lang;
}

/** Resolve a bilingual phrase against the current language. */
export function tr(id: string, en: string): string {
  return getLang() === "en" ? en : id;
}

/** Resolve a {id,en} object (used by the dialogue queue) against a language. */
export function pick(b: Bi, lang: Lang = getLang()): string {
  return lang === "en" ? b.en : b.id;
}

/** Sugar for building a bilingual phrase. */
export function bi(id: string, en: string): Bi {
  return { id, en };
}

/** First-run default: honor the browser, fall back to Indonesian. */
export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "id";
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "id";
}
