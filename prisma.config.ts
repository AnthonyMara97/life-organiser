import { existsSync } from "node:fs";

import { defineConfig, env } from "prisma/config";

// Prisma runs the CLI outside Next.js, so it does not find .env.local on its
// own. Node's built-in loader keeps that one file the single place secrets
// live; the guard means a machine without it (CI, a fresh clone) still works.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

// Read by the Prisma CLI (validate, migrate, studio). The app itself connects
// through a driver adapter created in src/server/db.ts — see the note in
// schema.prisma about why there are two places.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
