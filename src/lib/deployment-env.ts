/** Indica se NextAuth tem secret configurado (obrigatório em produção). */
export function hasAuthSecret(): boolean {
  return Boolean(
    (process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET)?.trim(),
  );
}

/** Indica se há URL de banco para o Prisma. */
export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Lista variáveis ausentes que impedem o admin em produção. */
export function getMissingProductionEnv(): string[] {
  const missing: string[] = [];
  if (!hasAuthSecret()) {
    missing.push("AUTH_SECRET ou NEXTAUTH_SECRET");
  }
  if (!hasDatabaseUrl()) {
    missing.push("DATABASE_URL");
  }
  return missing;
}
