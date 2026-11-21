import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// The one Prisma client for this process, built on a driver adapter.
//
// Prisma 7 no longer ships its own connection: it generates the query and hands
// it to an adapter, which owns the socket, the pool and the Postgres wire
// protocol. Swapping the adapter (or the connection string) changes how we
// reach the database, never what the application code says.
function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  // Fail loudly and early. Without this, `pg` silently falls back to
  // localhost:5432 and the real problem is disguised as "connection refused".
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Next's dev server re-evaluates modules on every edit. Keeping the client on
// `globalThis` means one pool per process instead of one per hot reload, which
// would exhaust Postgres connections within a few saves.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
