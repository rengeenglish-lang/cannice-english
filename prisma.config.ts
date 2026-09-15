import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma migrations need a direct PostgreSQL connection so advisory locks
    // are not routed through Neon/PgBouncer. Runtime queries continue to use
    // DATABASE_URL in server/db.ts.
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
