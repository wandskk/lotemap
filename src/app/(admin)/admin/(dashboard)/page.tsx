import Link from "next/link";
import { PublicLotStatus } from "@prisma/client";
import { getSession } from "@/lib/get-session";
import {
  developmentWhereForScope,
  getAdminDataScope,
  lotWhereForScope,
} from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const session = await getSession();
  const scope = await getAdminDataScope();

  const devWhere = developmentWhereForScope(scope);
  const lotWhere = lotWhereForScope(scope);

  const [devCount, publishedDevCount, lotTotal, lotAvailable] =
    scope.kind === "blocked"
      ? [0, 0, 0, 0]
      : await Promise.all([
          prisma.development.count({ where: devWhere }),
          prisma.development.count({
            where: { ...devWhere, published: true },
          }),
          prisma.lot.count({ where: lotWhere }),
          prisma.lot.count({
            where: {
              ...lotWhere,
              publicStatus: PublicLotStatus.AVAILABLE,
            },
          }),
        ]);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Painel administrativo</h1>
      <p className="mt-2 text-slate-700">
        Usuário autenticado: {session?.user?.email ?? "desconhecido"}
      </p>

      {scope.kind === "blocked" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {scope.reason === "no_db_user"
            ? "Cadastre seu e-mail na tabela de usuários (seed) para ver dados operacionais."
            : "Associe seu usuário a uma empresa em Usuários (superadmin) para acessar loteamentos."}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Loteamentos</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
              {devCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {publishedDevCount} publicados
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Lotes (total)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
              {lotTotal}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Lotes disponíveis</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
              {lotAvailable}
            </p>
          </div>
        </div>
      )}

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
