"use client";

import { useState } from "react";

type BlobUrlFieldProps = {
  name: string;
  defaultValue?: string;
  label: string;
  placeholder?: string;
  /** Ex.: "image/*" ou "image/*,.svg" */
  accept?: string;
  helperText?: string;
  className?: string;
};

export function BlobUrlField({
  name,
  defaultValue = "",
  label,
  placeholder = "https://...",
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  helperText,
  className = "flex flex-col gap-1 text-sm sm:col-span-2",
}: BlobUrlFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/blob", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      const raw = await res.text();
      let data: { url?: string; error?: string } = {};
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error(
            res.ok
              ? "Resposta invalida do servidor"
              : `Erro ${res.status}: resposta nao e JSON`,
          );
        }
      } else if (!res.ok) {
        throw new Error(`Erro ${res.status} no upload`);
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Falha no upload");
      }
      if (!data.url) {
        throw new Error("Servidor nao retornou a URL do arquivo");
      }
      setValue(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className={className}>
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        name={name}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        type="url"
        value={value}
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          accept={accept}
          className="max-w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1"
          disabled={uploading}
          onChange={onFileChange}
          type="file"
        />
        {uploading ? (
          <span className="text-xs text-slate-500">Enviando...</span>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs text-rose-600">{error}</span>
      ) : null}
      {helperText ? (
        <span className="text-xs text-slate-500">{helperText}</span>
      ) : null}
    </label>
  );
}
