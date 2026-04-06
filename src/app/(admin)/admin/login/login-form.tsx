"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AdminCallout } from "@/components/admin/admin-callout";
import { Button } from "@/components/ui/button";

type LoginFormProps = {
  /** Erro vindo da URL (ex.: callback NextAuth). */
  initialUrlError?: string | null;
};

export function LoginForm({ initialUrlError }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialUrlError ?? null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      aria-busy={loading}
      className="mt-8 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        setLoading(true);
        setError(null);
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/admin",
        });
        setLoading(false);
        if (res?.error) {
          setError("E-mail ou senha incorretos.");
          return;
        }
        if (res?.ok) {
          router.push(res.url ?? "/admin");
          router.refresh();
        }
      }}
    >
      {error ? (
        <AdminCallout variant="error">{error}</AdminCallout>
      ) : null}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          E-mail
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          disabled={loading}
          id="email"
          name="email"
          type="email"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          disabled={loading}
          id="password"
          name="password"
          type="password"
          required
        />
      </div>

      <Button className="w-full" disabled={loading} size="lg" type="submit">
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
