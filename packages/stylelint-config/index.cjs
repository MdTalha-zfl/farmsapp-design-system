/**
 * Shared Stylelint config. `scale-unlimited/declaration-strict-value` is the
 * enforcement mechanism referenced in System Blueprint §05: color, spacing,
 * radius, and shadow declarations may only reference a `var(--ds-*)` token,
 * never a raw literal. This is a build failure, not a lint warning that can
 * be ignored under deadline pressure.
 */
module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],
  rules: {
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "background", "border-color", "box-shadow", "fill", "stroke"],
      {
        ignoreValues: ["transparent", "currentColor", "inherit", "unset", "none"],
        expandShorthand: true,
        disableFix: true,
      },
    ],
    "custom-property-pattern": "^ds-[a-z0-9-]+$",
    "selector-class-pattern": null,
  },
};
