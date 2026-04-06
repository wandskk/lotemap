import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { AdminCallout } from "@/components/admin/admin-callout";
import { NameSlugFields } from "@/components/admin/name-slug-fields";
import { getCurrentDbUser, isSuperAdmin } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";

type CompaniesPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const me = await getCurrentDbUser();
  const sp = await searchParams;
  const err = sp.error;

  if (!me) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <AdminCallout variant="warning">
          Seu e-mail não está cadastrado como usuário no sistema.
        </AdminCallout>
      </section>
    );
  }

  if (!isSuperAdmin(me.role)) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <AdminCallout variant="warning">
          Apenas <strong>Superadmin</strong> pode cadastrar empresas.
        </AdminCallout>
        <p className="text-sm text-slate-600">
          <Link className="underline" href="/admin">
            Voltar ao painel
          </Link>
        </p>
      </section>
    );
  }

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { developments: true, users: true } },
    },
  });

  async function createCompany(formData: FormData) {
    "use server";
    const actor = await getCurrentDbUser();
    if (!actor || !isSuperAdmin(actor.role)) return;

    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = toSlug(slugInput || name);
    const email = String(formData.get("email") ?? "").trim() || null;
    const phone = String(formData.get("phone") ?? "").trim() || null;
    const cnpj = String(formData.get("cnpj") ?? "").trim() || null;
    const active = formData.get("active") === "on";

    if (!name || !slug) {
      redirect("/admin/companies?error=invalid");
    }

    try {
      await prisma.company.create({
        data: { name, slug, email, phone, cnpj, active },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        redirect("/admin/companies?error=duplicate_slug");
      }
      throw e;
    }
    revalidatePath("/admin/companies");
    revalidatePath("/admin/developments");
    redirect("/admin/companies");
  }

  async function updateCompany(formData: FormData) {
    "use server";
    const actor = await getCurrentDbUser();
    if (!actor || !isSuperAdmin(actor.role)) return;

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = toSlug(slugInput || name);
    const email = String(formData.get("email") ?? "").trim() || null;
    const phone = String(formData.get("phone") ?? "").trim() || null;
    const cnpj = String(formData.get("cnpj") ?? "").trim() || null;
    const active = formData.get("active") === "on";

    if (!id || !name || !slug) {
      redirect("/admin/companies?error=invalid");
    }

    try {
      await prisma.company.update({
        where: { id },
        data: { name, slug, email, phone, cnpj, active },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        redirect("/admin/companies?error=duplicate_slug");
      }
      throw e;
    }
    revalidatePath("/admin/companies");
    revalidatePath("/admin/developments");
    redirect("/admin/companies");
  }

  async function deleteCompany(formData: FormData) {
    "use server";
    const actor = await getCurrentDbUser();
    if (!actor || !isSuperAdmin(actor.role)) return;

    const id = String(formData.get("id") ?? "");
    if (!id) redirect("/admin/companies");

    const dCount = await prisma.development.count({ where: { companyId: id } });
    if (dCount > 0) {
      redirect("/admin/companies?error=has_developments");
    }

    await prisma.company.delete({ where: { id } });
    revalidatePath("/admin/companies");
    revalidatePath("/admin/developments");
    redirect("/admin/companies");
  }

  const errorMessage =
    err === "duplicate_slug"
      ? "Já existe uma empresa com este slug."
      : err === "has_developments"
        ? "Não é possível remover uma empresa que possui loteamentos."
        : err === "invalid"
          ? "Preencha nome e slug válidos."
          : null;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <p className="mt-2 text-slate-700">
          Cadastro de empresas (multi-tenant). Cada loteamento pertence a uma
          empresa.
        </p>
      </div>

      {errorMessage ? (
        <AdminCallout variant="error">{errorMessage}</AdminCallout>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Nova empresa</h2>
        <form action={createCompany} className="mt-4 grid gap-3 sm:grid-cols-2">
          <NameSlugFields
            autoSyncSlug
            nameLabelClassName="sm:col-span-2"
            namePlaceholder="Nome fantasia"
            slugLabel="Slug (URL)"
            slugLabelClassName="sm:col-span-2"
            slugPlaceholder="ex.: minha-incorporadora"
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">E-mail</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="email"
              type="email"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Telefone</span>
            <input className="rounded-md border border-slate-300 px-3 py-2" name="phone" />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">CNPJ (opcional)</span>
            <input className="rounded-md border border-slate-300 px-3 py-2" name="cnpj" />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input defaultChecked name="active" type="checkbox" />
            <span className="font-medium text-slate-700">Ativa</span>
          </label>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white sm:col-span-2 sm:w-max"
            type="submit"
          >
            Criar empresa
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-medium">Lista</h2>
        </div>
        <div className="p-5">
          {companies.length === 0 ? (
            <AdminCallout variant="neutral">Nenhuma empresa cadastrada.</AdminCallout>
          ) : (
            <div className="space-y-6">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <form action={updateCompany} className="grid gap-3 sm:grid-cols-2">
                    <input name="id" type="hidden" value={c.id} />
                    <NameSlugFields
                      key={c.id}
                      autoSyncSlug={false}
                      defaultName={c.name}
                      defaultSlug={c.slug}
                      nameLabelClassName="sm:col-span-2"
                      slugLabel="Slug"
                      slugLabelClassName="sm:col-span-2"
                      slugRequired
                    />
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">E-mail</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={c.email ?? ""}
                        name="email"
                        type="email"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Telefone</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={c.phone ?? ""}
                        name="phone"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">CNPJ</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={c.cnpj ?? ""}
                        name="cnpj"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input defaultChecked={c.active} name="active" type="checkbox" />
                      <span className="font-medium text-slate-700">Ativa</span>
                    </label>
                    <p className="text-xs text-slate-500 sm:col-span-2">
                      <span className="font-medium text-slate-700">Uso:</span>{" "}
                      {c._count.developments} loteamento(s), {c._count.users} usuário(s)
                    </p>
                    <button
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm sm:col-span-2 sm:w-max"
                      type="submit"
                    >
                      Salvar
                    </button>
                  </form>
                  <form action={deleteCompany} className="mt-3">
                    <input name="id" type="hidden" value={c.id} />
                    <button
                      className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={c._count.developments > 0}
                      title={
                        c._count.developments > 0
                          ? "Remova os loteamentos desta empresa antes"
                          : undefined
                      }
                      type="submit"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
