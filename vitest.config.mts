import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Tests import the same modules the app does, so the `@/` alias has to resolve
// here too. Without this, a module that uses `@/lib/...` fails only under test,
// which is a confusing place to discover it.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
