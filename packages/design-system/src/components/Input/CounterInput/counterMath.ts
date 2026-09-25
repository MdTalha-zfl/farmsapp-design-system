/**
 * Pure counter arithmetic — no React, no DOM, so the same file can back a
 * future React Native component. See
 * decisions/decision-counterinput-portable-usecounter-hook.md.
 */

// First code point of each 10-digit block whose digits are not covered by
// NFKC (full-width digits are). Covers the scripts this project's audience
// types in; anything else is dropped as a non-digit.
const DIGIT_BLOCK_STARTS = [
  0x0660, // Arabic-Indic
  0x06f0, // Extended Arabic-Indic
  0x0966, // Devanagari
  0x09e6, // Bengali
  0x0a66, // Gurmukhi
  0x0ae6, // Gujarati
  0x0b66, // Odia
  0x0be6, // Tamil
  0x0c66, // Telugu
  0x0ce6, // Kannada
  0x0d66, // Malayalam
] as const;

function toLatinDigit(character: string): string {
  const code = character.codePointAt(0) ?? 0;
  for (const start of DIGIT_BLOCK_STARTS) {
    if (code >= start && code < start + 10) return String(code - start);
  }
  return character;
}

/**
 * Turns whatever was typed or pasted into a draft: Latin digits, plus one
 * leading minus when negatives are allowed. Everything else is dropped.
 */
export function sanitizeDraft(text: string, allowNegative: boolean): string {
  const normalised = text.normalize("NFKC").replace(/−/g, "-");
  let digits = "";
  for (const character of normalised) {
    const latin = toLatinDigit(character);
    if (latin >= "0" && latin <= "9") digits += latin;
  }
  const isNegative = allowNegative && normalised.trimStart().startsWith("-");
  return isNegative ? `-${digits}` : digits;
}

/** `""` and a lone `"-"` are empty (`null`); anything else is an integer. */
export function parseDraft(draft: string): number | null {
  if (draft === "" || draft === "-") return null;
  const parsed = Number.parseInt(draft, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function clamp(value: number, min: number, max: number | undefined): number {
  const atLeastMin = value < min ? min : value;
  return max !== undefined && atLeastMin > max ? max : atLeastMin;
}

/**
 * One step from `current`. From empty, going up lands on `min` and going down
 * stays empty (there is nothing below it).
 */
export function stepValue(
  current: number | null,
  direction: 1 | -1,
  amount: number,
  min: number,
  max: number | undefined,
): number | null {
  if (current === null) return direction === 1 ? clamp(min, min, max) : null;
  return clamp(current + direction * amount, min, max);
}

/** The number of characters the widest allowed value needs (sign included). */
export function widestDigitCount(min: number, max: number | undefined): number {
  const widest = Math.max(String(min).length, max === undefined ? 3 : String(max).length, 2);
  return widest;
}
