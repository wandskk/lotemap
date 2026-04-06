import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link className="font-medium text-slate-900 underline" href="/">
            Voltar ao site
          </Link>
        </p>
      </main>
    </div>
  );
}
