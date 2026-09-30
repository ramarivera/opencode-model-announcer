/**
 * Root entrypoint for OpenCode's local plugin directory loader.
 * The plugin lives in src/ (package.json "main" is not honored for
 * local plugin directories — a root-level entry is required).
 */
export { default } from "./src/index"
