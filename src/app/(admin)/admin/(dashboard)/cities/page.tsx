import { revalidatePath } from "next/cache";
import { AdminCallout } from "@/components/admin/admin-callout";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    orderBy: [{ state: "asc" }, { name: "asc" }],
  });

  async function createCity(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const state = String(formData.get("state") ?? "").trim().toUpperCase();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = toSlug(slugInput || name);

    if (!name || !state || state.length !== 2 || !slug) return;

    await prisma.city.create({
      data: { name, state, slug },
    });
    revalidatePath("/admin/cities");
  }

  async function updateCity(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const state = String(formData.get("state") ?? "").trim().toUpperCase();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = toSlug(slugInput || name);

    if (!id || !name || !state || state.length !== 2 || !slug) return;

    await prisma.city.update({
      where: { id },
      data: { name, state, slug },
    });
    revalidatePath("/admin/cities");
  }

  async function deleteCity(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;

    await prisma.city.delete({ where: { id } });
    revalidatePath("/admin/cities");
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Cidades</h1>
        <p className="mt-2 text-slate-700">Cadastro base para loteamentos.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Nova cidade</h2>
        <form action={createCity} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            className="rounded-md border border-slate-300 px-3 py-2 sm:col-span-2"
            name="name"
            placeholder="Nome (ex.: Goiania)"
            required
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            maxLength={2}
            name="state"
            placeholder="UF (ex.: GO)"
            required
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            name="slug"
            placeholder="Slug (opcional)"
          />
          <button
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white sm:col-span-4 sm:w-max"
            type="submit"
          >
            Criar cidade
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-medium">Lista de cidades</h2>
        </div>
        <div className="p-5">
          {cities.length === 0 ? (
            <AdminCallout variant="neutral">
              Nenhuma cidade cadastrada. Use o formulário acima para criar a
              primeira.
            </AdminCallout>
          ) : (
            <div className="space-y-4">
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <form action={updateCity} className="grid gap-3 sm:grid-cols-4">
                    <input type="hidden" name="id" value={city.id} />
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2 sm:col-span-2"
                      defaultValue={city.name}
                      name="name"
                      required
                    />
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2"
                      defaultValue={city.state}
                      maxLength={2}
                      name="state"
                      required
                    />
                    <input
                      className="rounded-md border border-slate-300 px-3 py-2"
                      defaultValue={city.slug}
                      name="slug"
                      required
                    />
                    <button
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm sm:w-max"
                      type="submit"
                    >
                      Salvar
                    </button>
                  </form>

                  <form action={deleteCity} className="mt-3">
                    <input type="hidden" name="id" value={city.id} />
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
    </section>
  );
}
