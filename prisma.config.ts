import { defineConfig, env } from "prisma/config";

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
