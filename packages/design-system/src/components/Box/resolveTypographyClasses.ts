import { TOKEN_TEXT_PROPS, TEXT_KEYWORD_PROPS, className as atomicClassName } from "./atomicConfig.mjs";
import { VALID_STEPS } from "./generatedValidSteps.mjs";

export type TextVariantStep = "body-md" | "body-sm" | "caption";
export type HeadingVariant = "display" | "heading-lg" | "heading-md" | "heading-sm";
export type LetterSpacingStep = "tight" | "normal" | "wide";
export type TypographyLang = "en" | "hi";
export type TextColor = "primary" | "secondary" | "disabled" | "inverse" | "danger" | "warning" | "success";

// Shared by Text AND Heading (see resolveExtraTypographyClasses below) —
// traced against Blade's real Text/Heading prop reference. `TextWeight`
// stays a real primitive scale (typography.json's fontWeight, minus
// "bold" — deliberately not exposed on either component, matching the
// original scoping decision in decisions/decision-text-additional-props.md).
// `TextAlign`/`TextTransform` are closed unions of real CSS keywords, not
// Blade's own loose `CSSProperties['textTransform']` typing — same
// "closed union over raw string" correction `TextWordBreak` already got.
export type TextWeight = "regular" | "medium" | "semibold";
export type TextDecorationLine = "none" | "underline" | "line-through" | "dotted";
export type TextWordBreak = "normal" | "break-all" | "keep-all" | "break-word";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";

// Exported — Text.tsx reuses this directly for `weight`/`size` (its own,
// non-shared props), rather than duplicating the same warn-and-check logic.
export function warnIfInvalidStep(propLabel: string, varCategory: string, value: string): void {
  if (process.env.NODE_ENV === "production") return;
  const validSteps = VALID_STEPS[varCategory];
  if (validSteps && !validSteps.includes(value)) {
    console.warn(
      `@farmsapp/design-system: received ${propLabel}="${value}", which isn't one of ${validSteps.join(", ")}. ` +
        `This will render a class name with no matching CSS rule.`,
    );
  }
}

function resolveLetterSpacing(letterSpacing: LetterSpacingStep, lang: TypographyLang | undefined): LetterSpacingStep {
  if (lang === "hi" && letterSpacing !== "normal") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `@farmsapp/design-system: letterSpacing="${letterSpacing}" was requested together with lang="hi" — ` +
          `letter-spacing tokens are Latin-script only (Devanagari tracking can break how glyphs join). ` +
          `Forcing letterSpacing="normal" instead.`,
      );
    }
    return "normal";
  }
  return letterSpacing;
}

export function resolveTypographyClasses(
  variant: TextVariantStep | HeadingVariant,
  letterSpacing: LetterSpacingStep,
  lang: TypographyLang | undefined,
  color: TextColor | undefined,
): string {
  if (process.env.NODE_ENV !== "production") warnIfInvalidStep("variant", TOKEN_TEXT_PROPS.variant.varCategory, variant);
  const resolvedLetterSpacing = resolveLetterSpacing(letterSpacing, lang);

  const classes = [
    atomicClassName(TOKEN_TEXT_PROPS.variant.prefix, variant),
    atomicClassName(TOKEN_TEXT_PROPS.letterSpacing.prefix, resolvedLetterSpacing),
  ];

  if (color !== undefined) {
    if (process.env.NODE_ENV !== "production") warnIfInvalidStep("color", TOKEN_TEXT_PROPS.color.varCategory, color);
    classes.push(atomicClassName(TOKEN_TEXT_PROPS.color.prefix, color));
  }

  return classes.join(" ");
}

/**
 * Text and Heading's shared "extra" typography props — weight,
 * textDecorationLine, wordBreak, textAlign, textTransform. Extracted here
 * (Phase 5 Chunk 04 follow-up, matching Blade's real Heading prop
 * reference) rather than duplicated in both Text.tsx and Heading.tsx, the
 * same "derive/share, don't hand-duplicate" discipline this file's own
 * variant/letterSpacing/color resolution already follows. `size` is
 * deliberately NOT here — it stays Text-exclusive (Heading's `variant`
 * already IS its size axis; see decisions/decision-heading-blade-parity-props.md
 * for why Heading didn't adopt Blade's separate `size` scale), so Text.tsx
 * resolves it directly with its own caption-scoping guard logic before
 * calling this function.
 */
export function resolveExtraTypographyClasses({
  weight,
  textDecorationLine,
  wordBreak,
  textAlign,
  textTransform,
}: {
  // `| undefined` explicitly, not just `?:` — callers pass through
  // possibly-undefined destructured prop values directly (not omitting the
  // key), which `exactOptionalPropertyTypes` (tsconfig.base.json) treats as
  // a different case from omission. Same fix already established for
  // Inline's flexWrap / Text's unsafeStyle.
  weight: TextWeight | undefined;
  textDecorationLine: TextDecorationLine | undefined;
  wordBreak: TextWordBreak | undefined;
  textAlign: TextAlign | undefined;
  textTransform: TextTransform | undefined;
}): string {
  const classes: string[] = [];
  if (weight !== undefined) {
    if (process.env.NODE_ENV !== "production") warnIfInvalidStep("weight", TOKEN_TEXT_PROPS.weight.varCategory, weight);
    classes.push(atomicClassName(TOKEN_TEXT_PROPS.weight.prefix, weight));
  }
  if (textDecorationLine !== undefined) {
    classes.push(atomicClassName(TEXT_KEYWORD_PROPS.textDecorationLine.prefix, textDecorationLine));
  }
  if (wordBreak !== undefined) {
    classes.push(atomicClassName(TEXT_KEYWORD_PROPS.wordBreak.prefix, wordBreak));
  }
  if (textAlign !== undefined) {
    classes.push(atomicClassName(TEXT_KEYWORD_PROPS.textAlign.prefix, textAlign));
  }
  if (textTransform !== undefined) {
    classes.push(atomicClassName(TEXT_KEYWORD_PROPS.textTransform.prefix, textTransform));
  }
  return classes.join(" ");
}
