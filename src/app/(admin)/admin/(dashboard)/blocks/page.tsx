import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminCallout } from "@/components/admin/admin-callout";
import { prisma } from "@/lib/prisma";

type BlocksPageProps = {
  searchParams: Promise<{ developmentId?: string; error?: string }>;
};

export default async function BlocksPage({ searchParams }: BlocksPageProps) {
  const sp = await searchParams;
  const error = sp.error;

  const developments = await prisma.development.findMany({
    include: { city: true },
    orderBy: [{ name: "asc" }],
  });

  const selectedId =
    sp.developmentId && developments.some((d) => d.id === sp.developmentId)
      ? sp.developmentId
      : developments[0]?.id;

  const blocks = selectedId
    ? await prisma.block.findMany({
        where: { developmentId: selectedId },
        orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
      })
    : [];

  async function createBlock(formData: FormData) {
    "use server";
    const developmentId = String(formData.get("developmentId") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const sortOrderRaw = String(formData.get("sortOrder") ?? "0").trim();
    const sortOrder = Number.parseInt(sortOrderRaw, 10);

    if (!developmentId || !code) {
      redirect(`/admin/blocks?developmentId=${developmentId}`);
    }

    await prisma.block.create({
      data: {
        developmentId,
        code,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });
    revalidatePath("/admin/blocks");
    redirect(`/admin/blocks?developmentId=${developmentId}`);
  }

  async function updateBlock(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const developmentId = String(formData.get("developmentId") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const sortOrderRaw = String(formData.get("sortOrder") ?? "0").trim();
    const sortOrder = Number.parseInt(sortOrderRaw, 10);

    if (!id || !developmentId || !code) {
      redirect(`/admin/blocks?developmentId=${developmentId}`);
    }

    await prisma.block.update({
      where: { id },
      data: {
        code,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    });
    revalidatePath("/admin/blocks");
    redirect(`/admin/blocks?developmentId=${developmentId}`);
  }

  async function deleteBlock(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const developmentId = String(formData.get("developmentId") ?? "");
    if (!id || !developmentId) {
      redirect("/admin/blocks");
    }

    const lotCount = await prisma.lot.count({ where: { blockId: id } });
    if (lotCount > 0) {
      redirect(
        `/admin/blocks?developmentId=${developmentId}&error=has_lots`,
      );
    }

    await prisma.block.delete({ where: { id } });
    revalidatePath("/admin/blocks");
    redirect(`/admin/blocks?developmentId=${developmentId}`);
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Quadras</h1>
        <p className="mt-2 text-slate-700">
          Quadras pertencem a um loteamento. O codigo e unico dentro do mesmo
          loteamento.
        </p>
      </div>

      {developments.length === 0 ? (
        <AdminCallout title="Nenhum loteamento cadastrado" variant="warning">
          Cadastre um loteamento em{" "}
          <Link className="font-medium underline" href="/admin/developments">
            Loteamentos
          </Link>{" "}
          antes de criar quadras.
        </AdminCallout>
      ) : (
        <>
          <form className="flex flex-wrap items-end gap-3" method="get">
            <label className="flex min-w-0 max-w-full flex-col gap-1 text-sm sm:max-w-none">
              <span className="font-medium text-slate-700">Loteamento</span>
              <select
                className="w-full min-w-0 max-w-full rounded-md border border-slate-300 px-3 py-2 sm:w-auto sm:min-w-[240px] sm:max-w-none"
                name="developmentId"
                defaultValue={selectedId ?? ""}
              >
                {developments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.city.name}/{d.city.state}
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

          {error === "has_lots" ? (
            <AdminCallout variant="error">
              Não é possível remover uma quadra que ainda possui lotes. Remova ou
              mova os lotes antes.
            </AdminCallout>
          ) : null}

          {selectedId ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-medium">Nova quadra</h2>
                <form
                  action={createBlock}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <input
                    name="developmentId"
                    type="hidden"
                    value={selectedId}
                  />
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700">Codigo</span>
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2"
                      name="code"
                      placeholder="ex.: Q-A ou A"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700">Ordem</span>
                    <input
                      className="w-24 rounded-md border border-slate-300 px-3 py-2"
                      defaultValue={0}
                      name="sortOrder"
                      type="number"
                    />
                  </label>
                  <button
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    type="submit"
                  >
                    Criar quadra
                  </button>
                </form>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-medium">Quadras deste loteamento</h2>
                </div>
                <div className="p-5">
                  {blocks.length === 0 ? (
                    <AdminCallout variant="neutral">
                      Nenhuma quadra cadastrada neste loteamento. Use o
                      formulário acima para criar a primeira.
                    </AdminCallout>
                  ) : (
                    <div className="space-y-4">
                      {blocks.map((block) => (
                        <div
                          key={block.id}
                          className="rounded-md border border-slate-200 p-4"
                        >
                          <form
                            action={updateBlock}
                            className="flex flex-wrap items-end gap-3"
                          >
                            <input name="id" type="hidden" value={block.id} />
                            <input
                              name="developmentId"
                              type="hidden"
                              value={selectedId}
                            />
                            <label className="flex flex-col gap-1 text-sm">
                              <span className="font-medium text-slate-700">
                                Codigo
                              </span>
                              <input
                                className="rounded-md border border-slate-300 px-3 py-2"
                                defaultValue={block.code}
                                name="code"
                                required
                              />
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                              <span className="font-medium text-slate-700">
                                Ordem
                              </span>
                              <input
                                className="w-24 rounded-md border border-slate-300 px-3 py-2"
                                defaultValue={block.sortOrder}
                                name="sortOrder"
                                type="number"
                              />
                            </label>
                            <button
                              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
                              type="submit"
                            >
                              Salvar
                            </button>
                          </form>
                          <form action={deleteBlock} className="mt-3">
                            <input name="id" type="hidden" value={block.id} />
                            <input
                              name="developmentId"
                              type="hidden"
                              value={selectedId}
                            />
                            <button
                              className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700"
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
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
