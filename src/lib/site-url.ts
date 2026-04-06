/**
 * Base URL absoluta para metadados (Open Graph, canonical).
 * Defina NEXT_PUBLIC_SITE_URL em producao (ex.: https://app.exemplo.com).
 */
export function resolveMetadataBase(): URL | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv);
    } catch {
      return undefined;
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return undefined;
}
