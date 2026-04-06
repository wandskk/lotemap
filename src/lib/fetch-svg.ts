/** Resolve URL absoluta para fetch no servidor (URLs relativas tipo `/arquivo.svg`). */
export function resolveAbsoluteSvgUrl(pathOrUrl: string, origin: string): string {
  const t = pathOrUrl.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${origin.replace(/\/$/, "")}${t}`;
  return t;
}

export async function fetchSvgMarkup(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.includes("<svg")) return null;
    return text;
  } catch {
    return null;
  }
}
