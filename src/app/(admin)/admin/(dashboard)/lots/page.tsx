import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  InternalLotStatus,
  Prisma,
  PublicLotStatus,
} from "@prisma/client";
import { AdminCallout } from "@/components/admin/admin-callout";
import {
  assertDevelopmentAccessible,
  developmentWhereForScope,
  getAdminDataScope,
} from "@/lib/admin-scope";
import { getCurrentDbUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  createLotHistoryEntry,
  lotCrudSnapshotFromModel,
  lotCrudSnapshotFromParsedUpdate,
  lotCrudSnapshotsEqual,
} from "@/server/lot-history";

const PUBLIC_STATUSES: PublicLotStatus[] = [
  PublicLotStatus.AVAILABLE,
  PublicLotStatus.RESERVED,
  PublicLotStatus.SOLD,
  PublicLotStatus.UNAVAILABLE,
];

const INTERNAL_STATUSES: InternalLotStatus[] = [
  InternalLotStatus.NEW,
  InternalLotStatus.CONTACTED,
  InternalLotStatus.NEGOTIATION,
  InternalLotStatus.DOCUMENTATION,
  InternalLotStatus.CLOSED,
  InternalLotStatus.CANCELED,
];

function parseDecimal(raw: string): Prisma.Decimal | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return new Prisma.Decimal(t.replace(",", "."));
  } catch {
    return null;
  }
}

async function assertBlockInDevelopment(
  blockId: string,
  developmentId: string,
) {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { developmentId: true },
  });
  return block?.developmentId === developmentId;
}

type LotsPageProps = {
  searchParams: Promise<{ developmentId?: string; blockId?: string }>;
};

export default async function LotsPage({ searchParams }: LotsPageProps) {
  const sp = await searchParams;

  const scope = await getAdminDataScope();
  if (scope.kind === "blocked") {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Lotes</h1>
        <AdminCallout variant="warning">
          {scope.reason === "no_db_user"
            ? "Seu e-mail não está na tabela de usuários. Rode o seed ou peça cadastro."
            : "Seu usuário não está vinculado a uma empresa. Peça a um superadmin para associar sua conta a uma empresa."}
        </AdminCallout>
      </section>
    );
  }

  const devWhere = developmentWhereForScope(scope);

  const developments = await prisma.development.findMany({
    where: devWhere,
    include: { city: true },
    orderBy: [{ name: "asc" }],
  });

  const selectedDevId =
    sp.developmentId && developments.some((d) => d.id === sp.developmentId)
      ? sp.developmentId
      : developments[0]?.id;

  const blocks = selectedDevId
    ? await prisma.block.findMany({
        where: { developmentId: selectedDevId },
        orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
      })
    : [];

  const selectedBlockId =
    sp.blockId && blocks.some((b) => b.id === sp.blockId)
      ? sp.blockId
      : blocks[0]?.id;

  const lots = selectedBlockId
    ? await prisma.lot.findMany({
        where: { blockId: selectedBlockId },
        orderBy: [{ code: "asc" }],
      })
    : [];

  async function createLot(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;

    const developmentId = String(formData.get("developmentId") ?? "");
    const blockId = String(formData.get("blockId") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const number = String(formData.get("number") ?? "").trim();
    const publicStatus = String(
      formData.get("publicStatus") ?? PublicLotStatus.AVAILABLE,
    ) as PublicLotStatus;
    const internalStatus = String(
      formData.get("internalStatus") ?? InternalLotStatus.NEW,
    ) as InternalLotStatus;

    if (!developmentId || !blockId || !code || !number) {
      redirect(
        `/admin/lots?developmentId=${developmentId}&blockId=${blockId}`,
      );
    }
    if (!(await assertDevelopmentAccessible(developmentId, scope))) {
      redirect("/admin/lots");
    }
    if (!(await assertBlockInDevelopment(blockId, developmentId))) {
      redirect(`/admin/lots?developmentId=${developmentId}`);
    }

    const areaM2 = parseDecimal(String(formData.get("areaM2") ?? ""));
    const estimatedValue = parseDecimal(
      String(formData.get("estimatedValue") ?? ""),
    );
    const manualValue = parseDecimal(String(formData.get("manualValue") ?? ""));
    const publicNotes =
      String(formData.get("publicNotes") ?? "").trim() || null;
    const internalNotes =
      String(formData.get("internalNotes") ?? "").trim() || null;
    const geometryRef =
      String(formData.get("geometryRef") ?? "").trim() || null;
    const visiblePublicly = formData.get("visiblePublicly") === "on";
    const isFeatured = formData.get("isFeatured") === "on";

    if (!PUBLIC_STATUSES.includes(publicStatus)) return;
    if (!INTERNAL_STATUSES.includes(internalStatus)) return;

    await prisma.lot.create({
      data: {
        developmentId,
        blockId,
        code,
        number,
        publicStatus,
        internalStatus,
        areaM2: areaM2 ?? undefined,
        estimatedValue: estimatedValue ?? undefined,
        manualValue: manualValue ?? undefined,
        publicNotes,
        internalNotes,
        geometryRef,
        visiblePublicly,
        isFeatured,
      },
    });
    revalidatePath("/admin/lots");
    redirect(
      `/admin/lots?developmentId=${developmentId}&blockId=${blockId}`,
    );
  }

  async function updateLot(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;

    const id = String(formData.get("id") ?? "");
    const developmentId = String(formData.get("developmentId") ?? "");
    const blockId = String(formData.get("blockId") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const number = String(formData.get("number") ?? "").trim();
    const publicStatus = String(
      formData.get("publicStatus") ?? PublicLotStatus.AVAILABLE,
    ) as PublicLotStatus;
    const internalStatus = String(
      formData.get("internalStatus") ?? InternalLotStatus.NEW,
    ) as InternalLotStatus;

    if (!id || !developmentId || !blockId || !code || !number) {
      redirect(
        `/admin/lots?developmentId=${developmentId}&blockId=${blockId}`,
      );
    }
    if (!(await assertDevelopmentAccessible(developmentId, scope))) {
      redirect("/admin/lots");
    }
    if (!(await assertBlockInDevelopment(blockId, developmentId))) {
      redirect(`/admin/lots?developmentId=${developmentId}`);
    }

    const areaM2 = parseDecimal(String(formData.get("areaM2") ?? ""));
    const estimatedValue = parseDecimal(
      String(formData.get("estimatedValue") ?? ""),
    );
    const manualValue = parseDecimal(String(formData.get("manualValue") ?? ""));
    const publicNotes =
      String(formData.get("publicNotes") ?? "").trim() || null;
    const internalNotes =
      String(formData.get("internalNotes") ?? "").trim() || null;
    const geometryRef =
      String(formData.get("geometryRef") ?? "").trim() || null;
    const visiblePublicly = formData.get("visiblePublicly") === "on";
    const isFeatured = formData.get("isFeatured") === "on";

    if (!PUBLIC_STATUSES.includes(publicStatus)) return;
    if (!INTERNAL_STATUSES.includes(internalStatus)) return;

    const existing = await prisma.lot.findUnique({ where: { id } });
    if (!existing) {
      redirect(
        `/admin/lots?developmentId=${developmentId}&blockId=${blockId}`,
      );
    }

    await prisma.lot.update({
      where: { id },
      data: {
        blockId,
        code,
        number,
        publicStatus,
        internalStatus,
        areaM2,
        estimatedValue,
        manualValue,
        publicNotes,
        internalNotes,
        geometryRef,
        visiblePublicly,
        isFeatured,
      },
    });

    const previous = lotCrudSnapshotFromModel(existing);
    const next = lotCrudSnapshotFromParsedUpdate({
      blockId,
      code,
      number,
      publicStatus,
      internalStatus,
      areaM2,
      estimatedValue,
      manualValue,
      publicNotes,
      internalNotes,
      geometryRef,
      visiblePublicly,
      isFeatured,
    });
    const userId = await getCurrentDbUserId();
    if (userId && !lotCrudSnapshotsEqual(previous, next)) {
      await createLotHistoryEntry({
        lotId: id,
        userId,
        action: "LOT_UPDATE",
        previousValue: previous,
        newValue: next,
      });
    }

    revalidatePath("/admin/lots");
    revalidatePath(`/admin/lots/${id}`);
    redirect(
      `/admin/lots?developmentId=${developmentId}&blockId=${blockId}`,
    );
  }

  async function deleteLot(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;

    const id = String(formData.get("id") ?? "");
    const developmentId = String(formData.get("developmentId") ?? "");
    const blockId = String(formData.get("blockId") ?? "");
    if (!id || !developmentId || !blockId) {
      redirect("/admin/lots");
    }
    if (!(await assertDevelopmentAccessible(developmentId, scope))) {
      redirect("/admin/lots");
    }

    await prisma.lot.delete({ where: { id } });
    revalidatePath("/admin/lots");
    redirect(
      `/admin/lots?developmentId=${developmentId}&blockId=${blockId}`,
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Lotes</h1>
        <p className="mt-2 text-slate-700">
          Lotes pertencem a uma quadra. Codigo e unico no loteamento; numero e
          unico na quadra. Use <code className="text-sm">geometryRef</code> para
          vincular ao SVG.
        </p>
      </div>

      {developments.length === 0 ? (
        <AdminCallout title="Nenhum loteamento cadastrado" variant="warning">
          <Link className="font-medium underline" href="/admin/developments">
            Cadastre um loteamento
          </Link>{" "}
          e depois quadras em{" "}
          <Link className="font-medium underline" href="/admin/blocks">
            Quadras
          </Link>
          .
        </AdminCallout>
      ) : blocks.length === 0 ? (
        <AdminCallout title="Nenhuma quadra neste loteamento" variant="warning">
          <Link className="font-medium underline" href="/admin/blocks">
            Crie quadras
          </Link>{" "}
          antes dos lotes.
        </AdminCallout>
      ) : (
        <>
          <form className="flex flex-wrap items-end gap-3" method="get">
            <label className="flex min-w-0 max-w-full flex-col gap-1 text-sm sm:max-w-none">
              <span className="font-medium text-slate-700">Loteamento</span>
              <select
                className="w-full min-w-0 max-w-full rounded-md border border-slate-300 px-3 py-2 sm:w-auto sm:min-w-[220px] sm:max-w-none"
                name="developmentId"
                defaultValue={selectedDevId ?? ""}
              >
                {developments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.city.name}/{d.city.state}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 max-w-full flex-col gap-1 text-sm sm:max-w-none">
              <span className="font-medium text-slate-700">Quadra</span>
              <select
                className="w-full min-w-0 max-w-full rounded-md border border-slate-300 px-3 py-2 sm:w-auto sm:min-w-[160px] sm:max-w-none"
                name="blockId"
                defaultValue={selectedBlockId ?? ""}
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              type="submit"
            >
              Filtrar
            </button>
          </form>

          {selectedDevId && selectedBlockId ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-medium">Novo lote</h2>
                <form action={createLot} className="mt-4 space-y-4">
                  <input
                    name="developmentId"
                    type="hidden"
                    value={selectedDevId}
                  />
                  <input name="blockId" type="hidden" value={selectedBlockId} />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Codigo (unico no loteamento)
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        name="code"
                        placeholder="ex.: LT-01"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Numero (unico na quadra)
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        name="number"
                        placeholder="ex.: 15"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Area m2
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        name="areaM2"
                        placeholder="250,00"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        geometryRef (SVG)
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        name="geometryRef"
                        placeholder="QD-A_LT-01"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Status publico
                      </span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={PublicLotStatus.AVAILABLE}
                        name="publicStatus"
                      >
                        {PUBLIC_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Status interno
                      </span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={InternalLotStatus.NEW}
                        name="internalStatus"
                      >
                        {INTERNAL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Valor estimado (R$)
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        name="estimatedValue"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Valor manual (R$)
                      </span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        name="manualValue"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Observacao publica
                    </span>
                    <textarea
                      className="min-h-[60px] rounded-md border border-slate-300 px-3 py-2"
                      name="publicNotes"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Observacao interna
                    </span>
                    <textarea
                      className="min-h-[60px] rounded-md border border-slate-300 px-3 py-2"
                      name="internalNotes"
                    />
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input defaultChecked name="visiblePublicly" type="checkbox" />
                      <span>Visivel publicamente</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input name="isFeatured" type="checkbox" />
                      <span>Destaque</span>
                    </label>
                  </div>
                  <button
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    type="submit"
                  >
                    Criar lote
                  </button>
                </form>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-medium">Lotes desta quadra</h2>
                </div>
                <div className="p-5">
                  {lots.length === 0 ? (
                    <AdminCallout variant="neutral">
                      Nenhum lote cadastrado nesta quadra. Use o formulário acima
                      para criar o primeiro.
                    </AdminCallout>
                  ) : (
                    <div className="space-y-8">
                      {lots.map((lot) => (
                        <div
                          key={lot.id}
                          className="rounded-md border border-slate-200 p-4"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-slate-900">
                              {lot.code} — {lot.number}
                            </p>
                            <Link
                              className="text-sm text-slate-600 underline"
                              href={`/admin/lots/${lot.id}?dev=${encodeURIComponent(selectedDevId)}&block=${encodeURIComponent(selectedBlockId)}`}
                            >
                              Comprador e histórico
                            </Link>
                          </div>
                          <form action={updateLot} className="space-y-4">
                            <input name="id" type="hidden" value={lot.id} />
                            <input
                              name="developmentId"
                              type="hidden"
                              value={selectedDevId}
                            />
                            <label className="flex max-w-xs flex-col gap-1 text-sm">
                              <span className="font-medium text-slate-700">
                                Quadra (pode mover de quadra)
                              </span>
                              <select
                                className="rounded-md border border-slate-300 px-3 py-2"
                                defaultValue={lot.blockId}
                                name="blockId"
                                required
                              >
                                {blocks.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.code}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Codigo
                                </span>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={lot.code}
                                  name="code"
                                  required
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Numero
                                </span>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={lot.number}
                                  name="number"
                                  required
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Area m2
                                </span>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={
                                    lot.areaM2 != null
                                      ? String(lot.areaM2)
                                      : ""
                                  }
                                  name="areaM2"
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  geometryRef
                                </span>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={lot.geometryRef ?? ""}
                                  name="geometryRef"
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Status publico
                                </span>
                                <select
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={lot.publicStatus}
                                  name="publicStatus"
                                >
                                  {PUBLIC_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Status interno
                                </span>
                                <select
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={lot.internalStatus}
                                  name="internalStatus"
                                >
                                  {INTERNAL_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Valor estimado
                                </span>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={
                                    lot.estimatedValue != null
                                      ? String(lot.estimatedValue)
                                      : ""
                                  }
                                  name="estimatedValue"
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-slate-700">
                                  Valor manual
                                </span>
                                <input
                                  className="rounded-md border border-slate-300 px-3 py-2"
                                  defaultValue={
                                    lot.manualValue != null
                                      ? String(lot.manualValue)
                                      : ""
                                  }
                                  name="manualValue"
                                />
                              </label>
                            </div>
                            <label className="flex flex-col gap-1 text-sm">
                              <span className="font-medium text-slate-700">
                                Observacao publica
                              </span>
                              <textarea
                                className="min-h-[56px] rounded-md border border-slate-300 px-3 py-2"
                                defaultValue={lot.publicNotes ?? ""}
                                name="publicNotes"
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                              <span className="font-medium text-slate-700">
                                Observacao interna
                              </span>
                              <textarea
                                className="min-h-[56px] rounded-md border border-slate-300 px-3 py-2"
                                defaultValue={lot.internalNotes ?? ""}
                                name="internalNotes"
                              />
                            </label>
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  defaultChecked={lot.visiblePublicly}
                                  name="visiblePublicly"
                                  type="checkbox"
                                />
                                <span>Visivel publicamente</span>
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  defaultChecked={lot.isFeatured}
                                  name="isFeatured"
                                  type="checkbox"
                                />
                                <span>Destaque</span>
                              </label>
                            </div>
                            <button
                              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
                              type="submit"
                            >
                              Salvar lote
                            </button>
                          </form>
                          <form action={deleteLot} className="mt-3">
                            <input name="id" type="hidden" value={lot.id} />
                            <input
                              name="developmentId"
                              type="hidden"
                              value={selectedDevId}
                            />
                            <input
                              name="blockId"
                              type="hidden"
                              value={selectedBlockId}
                            />
                            <button
                              className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700"
                              type="submit"
                            >
                              Remover lote
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
