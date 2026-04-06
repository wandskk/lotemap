import Link from "next/link";
import { notFound } from "next/navigation";
import { DevelopmentMapPreview } from "@/components/map/development-map-preview";
import { fetchSvgMarkup, resolveAbsoluteSvgUrl } from "@/lib/fetch-svg";
import { prisma } from "@/lib/prisma";
import { getRequestOrigin } from "@/lib/request-origin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DevelopmentMapPage({ params }: PageProps) {
  const { id } = await params;

  const development = await prisma.development.findUnique({
    where: { id },
    include: {
      city: true,
      lots: {
        select: {
          id: true,
          code: true,
          geometryRef: true,
          publicStatus: true,
        },
      },
    },
  });

  if (!development) {
    notFound();
  }

  const origin = await getRequestOrigin();
  const svgUrl = development.mapSvgUrl
    ? resolveAbsoluteSvgUrl(development.mapSvgUrl, origin)
    : null;
  const svgMarkup = svgUrl ? await fetchSvgMarkup(svgUrl) : null;

  const lots = development.lots.map((l) => ({
    id: l.id,
    code: l.code,
    geometryRef: l.geometryRef,
    publicStatus: l.publicStatus,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Planta — {development.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {development.city.name}/{development.city.state} ·{" "}
            <code className="text-xs">
              {development.city.slug}/{development.slug}
            </code>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            href="/admin/developments"
          >
            Voltar aos loteamentos
          </Link>
          <Link
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            href="/admin/lots"
          >
            Editar lotes
          </Link>
        </div>
      </div>

      {development.mapSvgUrl && !svgMarkup ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Nao foi possivel carregar o SVG desta URL. Verifique se o link e
          publico e retorna um arquivo SVG (servidor Next faz o fetch).
        </p>
      ) : null}

      <DevelopmentMapPreview
        developmentName={development.name}
        lots={lots}
        svgMarkup={svgMarkup}
      />
    </section>
  );
}
