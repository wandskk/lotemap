/**
 * Normaliza um título ou nome em slug (URL): remove acentos, minúsculas, hífens.
 * Use no servidor ao salvar e no cliente para pré-visualizar o slug.
 */
export function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Alias de `toSlug` — gera o slug a partir do título/nome. */
export function slugFromTitle(title: string) {
  return toSlug(title);
}
