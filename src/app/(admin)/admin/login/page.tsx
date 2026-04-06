import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCallout } from "@/components/admin/admin-callout";
import { getMissingProductionEnv } from "@/lib/deployment-env";
import { getSession } from "@/lib/get-session";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const missingProdEnv =
    process.env.NODE_ENV === "production"
      ? getMissingProductionEnv()
      : [];

  const session = await getSession();
  if (session?.user) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const urlError =
    sp.error === "CredentialsSignin"
      ? "Não foi possível entrar. Verifique e-mail e senha."
      : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <main className="mx-auto w-full max-w-md">
        {missingProdEnv.length > 0 ? (
          <div className="mb-6">
            <AdminCallout
              title="Configuração incompleta no servidor"
              variant="error"
            >
              <p>
                Defina no painel do projeto (Vercel → Settings → Environment
                Variables) e faça um novo deploy:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {missingProdEnv.map((name) => (
                  <li key={name}>
                    <code className="text-xs">{name}</code>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs">
                Gere um valor seguro para{" "}
                <code className="rounded bg-rose-100 px-1">AUTH_SECRET</code>{" "}
                (ex.: <code className="text-xs">openssl rand -base64 32</code>).
                Use a mesma <code className="text-xs">DATABASE_URL</code> do
                Postgres (ex.: Vercel Postgres ou Neon).
              </p>
              <p className="mt-2 text-xs">
                Recomendado também:{" "}
                <code className="rounded bg-rose-100 px-1">NEXTAUTH_URL</code>{" "}
                com a URL pública do site (ex.:{" "}
                <code className="text-xs">https://lotemap.vercel.app</code>).
              </p>
            </AdminCallout>
          </div>
        ) : null}
        {missingProdEnv.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-semibold text-slate-900">
              Entrar no painel
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Use o e-mail e a senha do seu usuário (cadastrado em{" "}
              <strong>Usuários</strong> pelo superadmin). O seed cria o admin com
              senha igual a <code className="text-xs">ADMIN_PASSWORD</code> no{" "}
              <code className="text-xs">.env</code>.
            </p>
            <LoginForm initialUrlError={urlError} />
          </div>
        ) : null}
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link className="font-medium text-slate-900 underline" href="/">
            Voltar ao site
          </Link>
        </p>
      </main>
    </div>
  );
}
