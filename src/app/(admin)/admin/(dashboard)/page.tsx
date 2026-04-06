import Link from "next/link";
import { getSession } from "@/lib/get-session";

export default async function AdminHomePage() {
  const session = await getSession();

  return (
    <section>
      <h1 className="text-2xl font-semibold">Painel administrativo</h1>
      <p className="mt-2 text-slate-700">
        Usuário autenticado: {session?.user?.email ?? "desconhecido"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
          href="/admin/cities"
        >
          <p className="text-sm text-slate-600">Cidades</p>
          <p className="mt-1 font-medium text-slate-900">Abrir cadastro</p>
        </Link>
        <Link
          className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
          href="/admin/developments"
        >
          <p className="text-sm text-slate-600">Loteamentos</p>
          <p className="mt-1 font-medium text-slate-900">Abrir cadastro</p>
        </Link>
      </div>
    </section>
  );
}
