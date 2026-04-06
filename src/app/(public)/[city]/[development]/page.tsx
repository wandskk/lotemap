import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DevelopmentStatus } from "@prisma/client";
import { DevelopmentMapPreview } from "@/components/map/development-map-preview";
import { fetchSvgMarkup, resolveAbsoluteSvgUrl } from "@/lib/fetch-svg";
import { prisma } from "@/lib/prisma";
import { getRequestOrigin } from "@/lib/request-origin";
import { resolveMetadataBase } from "@/lib/site-url";

type PageProps = {
  params: Promise<{
    city: string;
    development: string;
  }>;
};

const getPublicDevelopment = cache(
  async (citySlug: string, developmentSlug: string) => {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });
    if (!city) return null;

    return prisma.development.findFirst({
      where: {
        cityId: city.id,
        slug: developmentSlug,
        published: true,
        status: DevelopmentStatus.PUBLISHED,
      },
      include: {
        city: true,
        lots: {
          where: { visiblePublicly: true },
          select: {
            id: true,
            code: true,
            geometryRef: true,
            publicStatus: true,
            areaM2: true,
            estimatedValue: true,
            publicNotes: true,
          },
        },
      },
    });
  },
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city, development } = await params;
  const dev = await getPublicDevelopment(city, development);
  if (!dev) {
    return { title: "LoteMap" };
  }
  const desc =
    dev.shortDescription?.trim() ||
    `Loteamento ${dev.name} em ${dev.city.name}.`;
  const path = `/${city}/${development}`;
  const base = resolveMetadataBase();
  return {
    title: `${dev.name} · ${dev.city.name}`,
    description: desc,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: dev.name,
      description: desc,
      type: "website",
      locale: "pt_BR",
      ...(base ? { url: new URL(path, base).toString() } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: dev.name,
      description: desc,
    },
  };
}

export default async function PublicDevelopmentPage({ params }: PageProps) {
  const { city: citySlug, development: developmentSlug } = await params;

  const development = await getPublicDevelopment(citySlug, developmentSlug);
  if (!development) {
    notFound();
  }

  const origin = await getRequestOrigin();
  const svgUrl = development.mapSvgUrl
    ? resolveAbsoluteSvgUrl(development.mapSvgUrl, origin)
    : null;
  const svgMarkup = svgUrl ? await fetchSvgMarkup(svgUrl) : null;

  const whatsappDigits = development.whatsapp?.replace(/\D/g, "") ?? "";
  const cityLabel = `${development.city.name}/${development.city.state}`;

  const lots = development.lots.map((l) => ({
    id: l.id,
    code: l.code,
    geometryRef: l.geometryRef,
    publicStatus: l.publicStatus,
    areaM2: l.areaM2 != null ? String(l.areaM2) : null,
    estimatedValue:
      l.estimatedValue != null ? String(l.estimatedValue) : null,
    publicNotes: l.publicNotes,
  }));

  const defaultWaMessage = `Olá! Vim pelo site do ${development.name} e gostaria de mais informações.`;

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo
      </a>
      <main
        className="min-h-screen bg-slate-50 pb-24"
        id="conteudo-principal"
        tabIndex={-1}
      >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-sm font-medium text-slate-500">
            {development.city.name} · {development.city.state}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {development.name}
          </h1>
          {development.shortDescription ? (
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              {development.shortDescription}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              href="#planta"
            >
              Ver planta dos lotes
            </a>
            {whatsappDigits ? (
              <a
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(defaultWaMessage)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Falar no WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {development.fullDescription ? (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-xl font-semibold text-slate-900">Sobre</h2>
          <p className="mt-4 max-w-none whitespace-pre-wrap text-slate-700">
            {development.fullDescription}
          </p>
        </section>
      ) : null}

      {development.address ? (
        <section className="mx-auto max-w-5xl px-6 py-6">
          <h2 className="text-xl font-semibold text-slate-900">Localização</h2>
          <p className="mt-2 text-slate-700">{development.address}</p>
        </section>
      ) : null}

      <section
        aria-labelledby="titulo-planta"
        className="mx-auto max-w-5xl scroll-mt-16 px-6 py-12"
        id="planta"
      >
        <h2 className="text-xl font-semibold text-slate-900" id="titulo-planta">
          Planta interativa
        </h2>
        <p className="mt-2 text-slate-600">
          Confira a disponibilidade. Valores e áreas são informativos; confirme
          com o comercial.
        </p>
        <div className="mt-6">
          <DevelopmentMapPreview
            cityLabel={cityLabel}
            developmentName={development.name}
            lots={lots}
            svgMarkup={svgMarkup}
            variant="public"
            whatsappDigits={whatsappDigits || null}
          />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-slate-500">
          {development.name} · {development.city.name}
        </div>
      </footer>

      {whatsappDigits ? (
        <a
          aria-label="Abrir WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition hover:bg-[#20bd5a]"
          href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(defaultWaMessage)}`}
          rel="noopener noreferrer"
          target="_blank"
          title="WhatsApp"
        >
          <span aria-hidden>💬</span>
        </a>
      ) : null}
    </main>
    </>
  );
}
