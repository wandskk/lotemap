"use client";

import { useState } from "react";
import { slugFromTitle } from "@/lib/slug";

export type NameSlugFieldsProps = {
  /** Em criação: o slug acompanha o nome até o usuário editar o slug. Em edição: use false. */
  autoSyncSlug: boolean;
  defaultName?: string;
  defaultSlug?: string;
  nameLabel?: string;
  slugLabel?: string;
  namePlaceholder?: string;
  slugPlaceholder?: string;
  titleFieldName?: string;
  slugFieldName?: string;
  nameRequired?: boolean;
  slugRequired?: boolean;
  /** Campos entre nome e slug (ex.: UF em cidades). */
  betweenTitleAndSlug?: React.ReactNode;
  /** Classes do label do nome (ex.: `sm:col-span-2`). */
  nameLabelClassName?: string;
  /** Classes do label do slug. */
  slugLabelClassName?: string;
};

export function NameSlugFields({
  autoSyncSlug,
  defaultName = "",
  defaultSlug = "",
  nameLabel = "Nome",
  slugLabel = "Slug (URL)",
  namePlaceholder,
  slugPlaceholder,
  titleFieldName = "name",
  slugFieldName = "slug",
  nameRequired = true,
  slugRequired = false,
  betweenTitleAndSlug,
  nameLabelClassName = "",
  slugLabelClassName = "",
}: NameSlugFieldsProps) {
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugEditedByUser, setSlugEditedByUser] = useState(!autoSyncSlug);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setName(v);
    if (autoSyncSlug && !slugEditedByUser) {
      setSlug(slugFromTitle(v));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setSlug(v);
    if (v === "") {
      setSlugEditedByUser(false);
      if (autoSyncSlug) setSlug(slugFromTitle(name));
      return;
    }
    setSlugEditedByUser(true);
  }

  return (
    <>
      <label
        className={`flex flex-col gap-1 text-sm ${nameLabelClassName}`.trim()}
      >
        <span className="font-medium text-slate-700">{nameLabel}</span>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          name={titleFieldName}
          onChange={handleNameChange}
          placeholder={namePlaceholder}
          required={nameRequired}
          value={name}
        />
      </label>
      {betweenTitleAndSlug}
      <label
        className={`flex flex-col gap-1 text-sm ${slugLabelClassName}`.trim()}
      >
        <span className="font-medium text-slate-700">{slugLabel}</span>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          name={slugFieldName}
          onChange={handleSlugChange}
          placeholder={slugPlaceholder}
          required={slugRequired}
          value={slug}
        />
      </label>
    </>
  );
}
