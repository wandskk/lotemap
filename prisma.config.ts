import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * URL usada só para carregar o config do Prisma (generate, migrate).
 * Em CI/Vercel, `postinstall` roda `prisma generate` antes de DATABASE_URL existir;
 * um placeholder evita falha — o generate não conecta ao banco.
 * Em runtime (app/seed), use sempre DATABASE_URL real no ambiente.
 */
function datasourceUrl(): string {
  const u = process.env.DATABASE_URL?.trim();
  if (u) return u;
  return "postgresql://postgres:postgres@127.0.0.1:5432/prisma_generate_placeholder";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl(),
  },
});
