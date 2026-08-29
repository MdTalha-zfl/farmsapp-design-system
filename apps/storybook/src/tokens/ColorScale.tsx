import { Box } from "@farmsapp/design-system";
import { readToken } from "./readToken";

const STEPS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;

/** One primitive color family's 1-12 scale, e.g. prefix="--ds-color-brand". */
export function ColorScale({ label, prefix }: { label: string; prefix: string }) {
  return (
    <Box>
      <Box paddingBottom="1" unsafeStyle={{ fontWeight: 600 }}>
        {label}
      </Box>
      <Box display="flex">
        {STEPS.map((step) => {
          const varName = `${prefix}-${step}`;
          const value = readToken(varName);
          return (
            <Box key={step} display="flex" flexDirection="column" alignItems="center" gap="0-5">
              <Box
                unsafeStyle={{ width: 56, height: 56, background: `var(${varName})` }}
                borderWidth="thin"
                borderColor="subtle"
              />
              <Box unsafeStyle={{ fontSize: "0.6875rem", fontFamily: "ui-monospace, monospace" }}>{step}</Box>
              <Box unsafeStyle={{ fontSize: "0.625rem", fontFamily: "ui-monospace, monospace", opacity: 0.7 }}>
                {value}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/** A single named semantic token — swatch plus the var() it resolves to. */
export function SemanticSwatch({ label, varName }: { label: string; varName: string }) {
  const value = readToken(varName);
  return (
    <Box display="flex" alignItems="center" gap="3">
      <Box
        unsafeStyle={{ width: 40, height: 40, flexShrink: 0, background: `var(${varName})` }}
        borderWidth="thin"
        borderColor="subtle"
        borderRadius="sm"
      />
      <Box>
        <Box unsafeStyle={{ fontSize: "0.8125rem" }}>{label}</Box>
        <Box unsafeStyle={{ fontSize: "0.6875rem", fontFamily: "ui-monospace, monospace", opacity: 0.7 }}>
          {varName} → {value}
        </Box>
      </Box>
    </Box>
  );
}
