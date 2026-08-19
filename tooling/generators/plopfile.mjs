// Both `add` destinations and `templateFile` sources resolve relative to
// this plopfile's own directory (tooling/generators), not the repo root or
// the invoking shell's cwd — confirmed by testing, not assumed. Destination
// paths below are prefixed with "../../" to land in the real packages/ dir.
export default function (plop) {
  plop.setGenerator("package", {
    description: "Scaffold a new publishable package under packages/",
    prompts: [
      { type: "input", name: "name", message: "Package name (e.g. tokens, utilities):" },
      {
        type: "confirm",
        name: "react",
        message: "Does this package need React / JSX?",
        default: false,
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../packages/{{dashCase name}}/package.json",
        templateFile: "templates/package/package.json.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{dashCase name}}/tsconfig.json",
        templateFile: "templates/package/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{dashCase name}}/rollup.config.mjs",
        templateFile: "templates/package/rollup.config.mjs.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{dashCase name}}/eslint.config.mjs",
        templateFile: "templates/package/eslint.config.mjs.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{dashCase name}}/src/index.{{#if react}}tsx{{else}}ts{{/if}}",
        templateFile: "templates/package/src-index.hbs",
      },
    ],
  });
}
