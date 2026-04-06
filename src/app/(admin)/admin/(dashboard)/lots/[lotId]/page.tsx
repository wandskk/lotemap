import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  assertLotAccessible,
  getAdminDataScope,
} from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUserId } from "@/lib/current-user";
import { createLotHistoryEntry } from "@/server/lot-history";

type PageProps = {
  params: Promise<{ lotId: string }>;
  searchParams: Promise<{ dev?: string; block?: string; error?: string }>;
};

function parseDecimal(raw: string): Prisma.Decimal | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return new Prisma.Decimal(t.replace(",", "."));
  } catch {
    return null;
  }
}

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function ownerSnapshot(
  o: {
    buyerName: string | null;
    buyerDocument: string | null;
    buyerPhone: string | null;
    buyerEmail: string | null;
    brokerName: string | null;
    negotiatedValue: Prisma.Decimal | null;
    reservationDate: Date | null;
    saleDate: Date | null;
    paymentMethod: string | null;
    contractSigned: boolean;
    notes: string | null;
  } | null,
) {
  if (!o) return null;
  return {
    buyerName: o.buyerName,
    buyerDocument: o.buyerDocument,
    buyerPhone: o.buyerPhone,
    buyerEmail: o.buyerEmail,
    brokerName: o.brokerName,
    negotiatedValue: o.negotiatedValue?.toString() ?? null,
    reservationDate: o.reservationDate?.toISOString() ?? null,
    saleDate: o.saleDate?.toISOString() ?? null,
    paymentMethod: o.paymentMethod,
    contractSigned: o.contractSigned,
    notes: o.notes,
  };
}

function parseOptionalDate(raw: string): Date | null {
  const t = raw.trim();
  if (!t) return null;
  const d = new Date(`${t}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function LotDetailPage({ params, searchParams }: PageProps) {
  const { lotId } = await params;
  const sp = await searchParams;
  const backHref =
    sp.dev && sp.block
      ? `/admin/lots?developmentId=${encodeURIComponent(sp.dev)}&blockId=${encodeURIComponent(sp.block)}`
      : "/admin/lots";
  const showNoUserError = sp.error === "no_user";

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      block: true,
      development: { include: { city: true } },
      ownerInfo: true,
    },
  });

  if (!lot) {
    notFound();
  }

  const scope = await getAdminDataScope();
  if (scope.kind === "blocked") {
    redirect("/admin/lots");
  }
  if (!(await assertLotAccessible(lotId, scope))) {
    notFound();
  }

  const history = await prisma.lotHistory.findMany({
    where: { lotId },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  async function saveOwnerInfo(formData: FormData) {
    "use server";
    const scope = await getAdminDataScope();
    if (scope.kind === "blocked") return;
    if (!(await assertLotAccessible(lotId, scope))) return;

    const fromDev = String(formData.get("fromDev") ?? "");
    const fromBlock = String(formData.get("fromBlock") ?? "");
    const back = `/admin/lots/${lotId}?dev=${encodeURIComponent(fromDev)}&block=${encodeURIComponent(fromBlock)}`;

    const userId = await getCurrentDbUserId();
    if (!userId) {
      redirect(`${back}&error=no_user`);
    }

    const id = String(formData.get("lotId") ?? "");
    if (id !== lotId) return;

    const prev = await prisma.lotOwnerInfo.findUnique({
      where: { lotId: id },
    });

    const buyerName =
      String(formData.get("buyerName") ?? "").trim() || null;
    const buyerDocument =
      String(formData.get("buyerDocument") ?? "").trim() || null;
    const buyerPhone =
      String(formData.get("buyerPhone") ?? "").trim() || null;
    const buyerEmail =
      String(formData.get("buyerEmail") ?? "").trim() || null;
    const brokerName =
      String(formData.get("brokerName") ?? "").trim() || null;
    const negotiatedValue = parseDecimal(
      String(formData.get("negotiatedValue") ?? ""),
    );
    const reservationDate = parseOptionalDate(
      String(formData.get("reservationDate") ?? ""),
    );
    const saleDate = parseOptionalDate(String(formData.get("saleDate") ?? ""));
    const paymentMethod =
      String(formData.get("paymentMethod") ?? "").trim() || null;
    const contractSigned = formData.get("contractSigned") === "on";
    const notes = String(formData.get("notes") ?? "").trim() || null;

    const nextData = {
      buyerName,
      buyerDocument,
      buyerPhone,
      buyerEmail,
      brokerName,
      negotiatedValue,
      reservationDate,
      saleDate,
      paymentMethod,
      contractSigned,
      notes,
    };

    await prisma.lotOwnerInfo.upsert({
      where: { lotId: id },
      create: {
        lotId: id,
        ...nextData,
      },
      update: nextData,
    });

    await createLotHistoryEntry({
      lotId: id,
      userId,
      action: "LOT_OWNER_INFO_SAVE",
      previousValue: ownerSnapshot(prev),
      newValue: {
        ...nextData,
        negotiatedValue: negotiatedValue?.toString() ?? null,
        reservationDate: reservationDate?.toISOString() ?? null,
        saleDate: saleDate?.toISOString() ?? null,
      },
    });

    revalidatePath(`/admin/lots/${lotId}`);
    revalidatePath("/admin/lots");
    redirect(back);
  }

  const o = lot.ownerInfo;

  return (
    <section className="space-y-8">
      {showNoUserError ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Não foi possível registrar histórico: seu e-mail de login não está
          cadastrado na tabela de usuários. Rode o seed ou crie o usuário no
          banco.
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm text-slate-600 underline"
            href={backHref}
          >
            Voltar aos lotes
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            Lote {lot.code} — {lot.development.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {lot.development.city.name}/{lot.development.city.state} · Quadra{" "}
            {lot.block.code}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Dados do comprador (interno)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Informacoes nao aparecem na landing publica.
        </p>
        <form action={saveOwnerInfo} className="mt-4 space-y-4">
          <input name="lotId" type="hidden" value={lot.id} />
          <input name="fromDev" type="hidden" value={sp.dev ?? ""} />
          <input name="fromBlock" type="hidden" value={sp.block ?? ""} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Nome</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.buyerName ?? ""}
                name="buyerName"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Documento</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.buyerDocument ?? ""}
                name="buyerDocument"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Telefone</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.buyerPhone ?? ""}
                name="buyerPhone"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Email</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.buyerEmail ?? ""}
                name="buyerEmail"
                type="email"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Corretor</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.brokerName ?? ""}
                name="brokerName"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">
                Valor negociado (R$)
              </span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={
                  o?.negotiatedValue != null ? String(o.negotiatedValue) : ""
                }
                name="negotiatedValue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Reserva (data)</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={toDateInput(o?.reservationDate)}
                name="reservationDate"
                type="date"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Venda (data)</span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={toDateInput(o?.saleDate)}
                name="saleDate"
                type="date"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">
                Forma de pagamento
              </span>
              <input
                className="rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.paymentMethod ?? ""}
                name="paymentMethod"
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                defaultChecked={o?.contractSigned ?? false}
                name="contractSigned"
                type="checkbox"
              />
              <span>Contrato assinado</span>
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">
                Observacoes internas (comprador)
              </span>
              <textarea
                className="min-h-[72px] rounded-md border border-slate-300 px-3 py-2"
                defaultValue={o?.notes ?? ""}
                name="notes"
              />
            </label>
          </div>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            type="submit"
          >
            Salvar dados do comprador
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Historico de alteracoes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ultimas alteracoes registradas neste lote.
        </p>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nenhum registro ainda. O historico e criado ao salvar os dados do
            comprador ou ao editar o lote na lista (se usuario estiver no
            banco).
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((h) => (
              <li
                key={h.id}
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {h.createdAt.toLocaleString("pt-BR")} ·{" "}
                    {h.user.name ?? h.user.email}
                  </span>
                  <span className="font-medium text-slate-700">{h.action}</span>
                </div>
                <div className="mt-2 grid gap-1 text-xs text-slate-600 md:grid-cols-2">
                  <pre className="max-h-32 overflow-auto rounded bg-white p-2 text-[11px]">
                    {JSON.stringify(h.previousValue, null, 2)}
                  </pre>
                  <pre className="max-h-32 overflow-auto rounded bg-white p-2 text-[11px]">
                    {JSON.stringify(h.newValue, null, 2)}
                  </pre>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
