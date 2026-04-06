import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminCallout } from "@/components/admin/admin-callout";
import {
  DevelopmentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";

const STATUS_OPTIONS: DevelopmentStatus[] = [
  DevelopmentStatus.DRAFT,
  DevelopmentStatus.PUBLISHED,
  DevelopmentStatus.ARCHIVED,
];

function parseOptionalDecimal(raw: string): Prisma.Decimal | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return new Prisma.Decimal(t.replace(",", "."));
  } catch {
    return null;
  }
}

export default async function DevelopmentsPage() {
  const [developments, companies, cities] = await Promise.all([
    prisma.development.findMany({
      include: { company: true, city: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.company.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.city.findMany({
      orderBy: [{ state: "asc" }, { name: "asc" }],
    }),
  ]);

  async function createDevelopment(formData: FormData) {
    "use server";
    const companyId = String(formData.get("companyId") ?? "");
    const cityId = String(formData.get("cityId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = toSlug(slugInput || name);
    const shortDescription =
      String(formData.get("shortDescription") ?? "").trim() || null;
    const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
    const address = String(formData.get("address") ?? "").trim() || null;
    const status = String(
      formData.get("status") ?? DevelopmentStatus.DRAFT,
    ) as DevelopmentStatus;
    const published = formData.get("published") === "on";
    const priceRaw = String(formData.get("pricePerSquareMeter") ?? "");
    const pricePerSquareMeter = parseOptionalDecimal(priceRaw);
    const mapSvgUrl =
      String(formData.get("mapSvgUrl") ?? "").trim() || null;

    if (!companyId || !cityId || !name || !slug) return;
    if (!STATUS_OPTIONS.includes(status)) return;

    await prisma.development.create({
      data: {
        companyId,
        cityId,
        name,
        slug,
        shortDescription,
        whatsapp,
        address,
        status,
        published,
        pricePerSquareMeter: pricePerSquareMeter ?? undefined,
        mapSvgUrl,
      },
    });
    revalidatePath("/admin/developments");
  }

  async function updateDevelopment(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const companyId = String(formData.get("companyId") ?? "");
    const cityId = String(formData.get("cityId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = toSlug(slugInput || name);
    const shortDescription =
      String(formData.get("shortDescription") ?? "").trim() || null;
    const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
    const address = String(formData.get("address") ?? "").trim() || null;
    const status = String(
      formData.get("status") ?? DevelopmentStatus.DRAFT,
    ) as DevelopmentStatus;
    const published = formData.get("published") === "on";
    const priceRaw = String(formData.get("pricePerSquareMeter") ?? "");
    const pricePerSquareMeter = parseOptionalDecimal(priceRaw);
    const mapSvgUrl =
      String(formData.get("mapSvgUrl") ?? "").trim() || null;

    if (!id || !companyId || !cityId || !name || !slug) return;
    if (!STATUS_OPTIONS.includes(status)) return;

    await prisma.development.update({
      where: { id },
      data: {
        companyId,
        cityId,
        name,
        slug,
        shortDescription,
        whatsapp,
        address,
        status,
        published,
        pricePerSquareMeter,
        mapSvgUrl,
      },
    });
    revalidatePath("/admin/developments");
  }

  async function deleteDevelopment(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.development.delete({ where: { id } });
    revalidatePath("/admin/developments");
  }

  const noPrereq = companies.length === 0 || cities.length === 0;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Loteamentos</h1>
        <p className="mt-2 text-slate-700">
          Cada loteamento pertence a uma empresa e a uma cidade. O slug e unico
          por cidade.
        </p>
      </div>

      {noPrereq ? (
        <AdminCallout title="Cadastre antes" variant="warning">
          É necessário pelo menos uma empresa (o seed cria uma demo) e uma
          cidade. Use o menu Cidades ou rode{" "}
          <code className="rounded bg-amber-100 px-1 text-amber-950">
            npm run prisma:seed
          </code>
          .
        </AdminCallout>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Novo loteamento</h2>
        <form
          action={createDevelopment}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Empresa</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              name="companyId"
              required
              disabled={companies.length === 0}
            >
              <option value="">Selecione</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Cidade</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              name="cityId"
              required
              disabled={cities.length === 0}
            >
              <option value="">Selecione</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Nome</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="name"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">
              Slug (opcional, gera a partir do nome)
            </span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="slug"
              placeholder="ex.: residencial-das-palmeiras"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Descricao curta</span>
            <textarea
              className="min-h-[72px] rounded-md border border-slate-300 px-3 py-2"
              name="shortDescription"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">WhatsApp (E.164)</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="whatsapp"
              placeholder="5562999999999"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Endereco</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="address"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Status</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              name="status"
              defaultValue={DevelopmentStatus.DRAFT}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">
              Preco medio R$/m2 (opcional)
            </span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="pricePerSquareMeter"
              placeholder="150,00"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">
              URL da planta SVG (http/https)
            </span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="mapSvgUrl"
              placeholder="https://..."
              type="url"
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input name="published" type="checkbox" />
            <span className="font-medium text-slate-700">Publicado</span>
          </label>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white sm:col-span-2 sm:w-max"
            disabled={noPrereq}
            type="submit"
          >
            Criar loteamento
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-medium">Lista de loteamentos</h2>
        </div>
        <div className="p-5">
          {developments.length === 0 ? (
            <AdminCallout variant="neutral">
              Nenhum loteamento cadastrado. Preencha o formulário acima quando
              empresa e cidade estiverem disponíveis.
            </AdminCallout>
          ) : (
            <div className="space-y-6">
              {developments.map((dev) => (
                <div
                  key={dev.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <form
                    action={updateDevelopment}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={dev.id} />
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Empresa</span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.companyId}
                        name="companyId"
                        required
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Cidade</span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.cityId}
                        name="cityId"
                        required
                      >
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.state})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">Nome</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.name}
                        name="name"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">Slug</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.slug}
                        name="slug"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">
                        Descricao curta
                      </span>
                      <textarea
                        className="min-h-[72px] rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.shortDescription ?? ""}
                        name="shortDescription"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">WhatsApp</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.whatsapp ?? ""}
                        name="whatsapp"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Endereco</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.address ?? ""}
                        name="address"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Status</span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.status}
                        name="status"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Preco R$/m2
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={
                          dev.pricePerSquareMeter != null
                            ? String(dev.pricePerSquareMeter)
                            : ""
                        }
                        name="pricePerSquareMeter"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">
                        URL da planta SVG
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={dev.mapSvgUrl ?? ""}
                        name="mapSvgUrl"
                        placeholder="https://..."
                        type="url"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input
                        defaultChecked={dev.published}
                        name="published"
                        type="checkbox"
                      />
                      <span className="font-medium text-slate-700">
                        Publicado
                      </span>
                    </label>
                    <button
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm sm:col-span-2 sm:w-max"
                      type="submit"
                    >
                      Salvar
                    </button>
                  </form>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="text-xs text-slate-500">
                      {dev.city.slug}/{dev.slug} · {dev.company.name}
                    </p>
                    <Link
                      className="text-sm font-medium text-slate-900 underline"
                      href={`/admin/developments/${dev.id}/map`}
                    >
                      Preview da planta
                    </Link>
                  </div>

                  <form action={deleteDevelopment} className="mt-3">
                    <input type="hidden" name="id" value={dev.id} />
                    <button
                      className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700"
                      type="submit"
                    >
                      Remover (apaga quadras e lotes vinculados)
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
