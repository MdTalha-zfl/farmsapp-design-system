/**
 * Minimal ambient declaration for the process.env.NODE_ENV dev-mode check in
 * Box.tsx (bundler-replaced dead code, standard React-ecosystem convention).
 * Deliberately NOT the full @types/node — this package ships to the
 * browser, and @types/node would add Node's whole global surface
 * (filesystem, Buffer, ...) to a browser-targeted package's ambient types.
 */
declare const process: { env: { NODE_ENV?: string } };
