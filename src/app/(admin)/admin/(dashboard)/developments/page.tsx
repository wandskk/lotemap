import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminCallout } from "@/components/admin/admin-callout";
import { BlobUrlField } from "@/components/admin/blob-url-field";
import { NameSlugFields } from "@/components/admin/name-slug-fields";
import {
  DevelopmentStatus,
  Prisma,
} from "@prisma/client";
import {
  assertDevelopmentAccessible,
  developmentWhereForScope,
  getAdminDataScope,
} from "@/lib/admin-scope";
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
  const scope = await getAdminDataScope();

  if (scope.kind === "blocked") {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Loteamentos</h1>
        <AdminCallout variant="warning">
          {scope.reason === "no_db_user"
            ? "Seu e-mail não está na tabela de usuários. Rode o seed ou peça cadastro."
            : "Seu usuário não está vinculado a uma empresa. Peça a um superadmin para associar sua conta a uma empresa em Usuários."}
        </AdminCallout>
      </section>
    );
  }

  const devWhere = developmentWhereForScope(scope);

  const [developments, companies, cities] = await Promise.all([
    prisma.development.findMany({
      where: devWhere,
      include: { company: true, city: true },
      orderBy: { updatedAt: "desc" },
    }),
    scope.kind === "superadmin"
      ? prisma.company.findMany({
          where: { active: true },
          orderBy: { name: "asc" },
        })
      : prisma.company.findMany({
          where: { id: scope.companyId, active: true },
          orderBy: { name: "asc" },
        }),
    prisma.city.findMany({
      orderBy: [{ state: "asc" }, { name: "asc" }],
    }),
  ]);

  async function createDevelopment(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;

    let companyId = String(formData.get("companyId") ?? "");
    if (scope.kind === "company") companyId = scope.companyId;

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
    const bannerUrl =
      String(formData.get("bannerUrl") ?? "").trim() || null;
    const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
    const mapSvgUrl =
      String(formData.get("mapSvgUrl") ?? "").trim() || null;

    if (!companyId || !cityId || !name || !slug) return;
    if (!STATUS_OPTIONS.includes(status)) return;
    if (scope.kind === "company" && companyId !== scope.companyId) return;

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
        bannerUrl,
        logoUrl,
        mapSvgUrl,
      },
    });
    revalidatePath("/admin/developments");
  }

  async function updateDevelopment(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;

    const id = String(formData.get("id") ?? "");
    let companyId = String(formData.get("companyId") ?? "");
    if (scope.kind === "company") companyId = scope.companyId;

    if (!(await assertDevelopmentAccessible(id, scope))) return;
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
    const bannerUrl =
      String(formData.get("bannerUrl") ?? "").trim() || null;
    const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
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
        bannerUrl,
        logoUrl,
        mapSvgUrl,
      },
    });
    revalidatePath("/admin/developments");
  }

  async function deleteDevelopment(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;

    const id = String(formData.get("id") ?? "");
    if (!id) return;
    if (!(await assertDevelopmentAccessible(id, scope))) return;

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
        {scope.kind === "company" ? (
          <p className="mt-2 text-sm text-slate-600">
            Você acessa apenas loteamentos da empresa{" "}
            <strong>{scope.companyName}</strong>.
          </p>
        ) : null}
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
          {scope.kind === "superadmin" ? (
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
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Empresa</span>
              <input name="companyId" type="hidden" value={scope.companyId} />
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                {scope.companyName}
              </p>
            </div>
          )}
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
          <NameSlugFields
            autoSyncSlug
            nameLabelClassName="sm:col-span-2"
            slugLabel="Slug (opcional)"
            slugLabelClassName="sm:col-span-2"
            slugPlaceholder="ex.: residencial-das-palmeiras"
          />
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
          <BlobUrlField
            accept="image/jpeg,image/png,image/webp,image/gif"
            helperText="Ou cole uma URL. Envio via Vercel Blob."
            label="Banner (imagem)"
            name="bannerUrl"
            placeholder="https://..."
          />
          <BlobUrlField
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            helperText="Ou cole uma URL. Envio via Vercel Blob."
            label="Logo"
            name="logoUrl"
            placeholder="https://..."
          />
          <BlobUrlField
            accept="image/svg+xml"
            helperText="Planta vetorial (SVG). Ou cole a URL publica."
            label="Planta SVG"
            name="mapSvgUrl"
            placeholder="https://..."
          />
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
                    {scope.kind === "superadmin" ? (
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
                    ) : (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="font-medium text-slate-700">Empresa</span>
                        <input name="companyId" type="hidden" value={scope.companyId} />
                        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                          {scope.companyName}
                        </p>
                      </div>
                    )}
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
                    <NameSlugFields
                      key={dev.id}
                      autoSyncSlug={false}
                      defaultName={dev.name}
                      defaultSlug={dev.slug}
                      nameLabelClassName="sm:col-span-2"
                      slugLabel="Slug"
                      slugLabelClassName="sm:col-span-2"
                      slugRequired
                    />
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
                    <BlobUrlField
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      defaultValue={dev.bannerUrl ?? ""}
                      helperText="Ou cole uma URL. Envio via Vercel Blob."
                      key={`${dev.id}-banner`}
                      label="Banner (imagem)"
                      name="bannerUrl"
                      placeholder="https://..."
                    />
                    <BlobUrlField
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      defaultValue={dev.logoUrl ?? ""}
                      helperText="Ou cole uma URL. Envio via Vercel Blob."
                      key={`${dev.id}-logo`}
                      label="Logo"
                      name="logoUrl"
                      placeholder="https://..."
                    />
                    <BlobUrlField
                      accept="image/svg+xml"
                      defaultValue={dev.mapSvgUrl ?? ""}
                      helperText="Planta vetorial (SVG). Ou cole a URL publica."
                      key={`${dev.id}-mapSvg`}
                      label="Planta SVG"
                      name="mapSvgUrl"
                      placeholder="https://..."
                    />
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
