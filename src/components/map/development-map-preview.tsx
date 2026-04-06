"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

export type MapLotForPreview = {
  id: string;
  code: string;
  geometryRef: string | null;
  publicStatus: string;
  /** Texto ja formatado para exibicao */
  areaM2?: string | null;
  estimatedValue?: string | null;
  publicNotes?: string | null;
};

function colorForStatus(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "#22c55e";
    case "RESERVED":
      return "#eab308";
    case "SOLD":
      return "#64748b";
    case "UNAVAILABLE":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

function findLotElement(root: HTMLElement, ref: string): Element | null {
  try {
    const byId = root.querySelector(`#${CSS.escape(ref)}`);
    if (byId) return byId;
  } catch {
    /* invalid ref */
  }
  const nodes = root.querySelectorAll("[data-lot-id]");
  for (const n of nodes) {
    if (n.getAttribute("data-lot-id") === ref) return n;
  }
  return null;
}

function paintElement(el: Element, color: string, selected: boolean) {
  const stroke = selected ? "#0f172a" : "rgba(15,23,42,0.25)";
  const strokeW = selected ? 3 : 1;
  if (el.tagName.toLowerCase() === "g") {
    el.querySelectorAll("path, polygon, rect, circle, ellipse").forEach(
      (child) => {
        const svg = child as SVGElement;
        svg.style.fill = color;
        svg.style.stroke = stroke;
        svg.style.strokeWidth = String(strokeW);
        svg.style.cursor = "pointer";
      },
    );
  } else {
    const svg = el as SVGElement;
    svg.style.fill = color;
    svg.style.stroke = stroke;
    svg.style.strokeWidth = String(strokeW);
    svg.style.cursor = "pointer";
  }
}

type DevelopmentMapPreviewProps = {
  svgMarkup: string | null;
  lots: MapLotForPreview[];
  developmentName: string;
  variant?: "admin" | "public";
  /** WhatsApp em E.164 (apenas digitos). Mensagem contextual no lote selecionado. */
  whatsappDigits?: string | null;
  /** Cidade + nome para texto do WhatsApp */
  cityLabel?: string;
};

function whatsappMessageForLot(
  developmentName: string,
  cityLabel: string | undefined,
  lot: MapLotForPreview,
) {
  const area = lot.areaM2 ? ` (${lot.areaM2} m²)` : "";
  return `Olá! Tenho interesse no lote ${lot.code}${area}, no loteamento ${developmentName}${cityLabel ? ` em ${cityLabel}` : ""}. Pode me passar mais detalhes?`;
}

export function DevelopmentMapPreview({
  svgMarkup,
  lots,
  developmentName,
  variant = "admin",
  whatsappDigits,
  cityLabel,
}: DevelopmentMapPreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const applyColors = useCallback(() => {
    const root = wrapRef.current;
    if (!root) return;

    for (const lot of lots) {
      if (!lot.geometryRef) continue;
      const el = findLotElement(root, lot.geometryRef);
      if (!el) continue;
      const selected = lot.id === selectedId;
      paintElement(el, colorForStatus(lot.publicStatus), selected);
    }
  }, [lots, selectedId]);

  useEffect(() => {
    applyColors();
  }, [applyColors, svgMarkup]);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      let node: Element | null = target;
      for (let i = 0; i < 8 && node; i++) {
        const id = node.getAttribute("id");
        const dataId = node.getAttribute("data-lot-id");
        const ref = dataId ?? id;
        if (ref) {
          const lot = lots.find((l) => l.geometryRef === ref);
          if (lot) {
            setSelectedId(lot.id);
            return;
          }
        }
        node = node.parentElement;
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [lots]);

  if (!svgMarkup) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {variant === "public"
          ? "Planta indisponível no momento."
          : "Nenhuma URL de SVG configurada. Informe a URL da planta em Loteamentos e salve."}
      </p>
    );
  }

  const selected = lots.find((l) => l.id === selectedId);
  const isPublic = variant === "public";

  return (
    <div className="space-y-4">
      {!isPublic ? (
        <p className="text-sm text-slate-600">
          {developmentName} — zoom com scroll ou gestos; clique em um lote
          vinculado por <code className="text-xs">geometryRef</code> (id no
          SVG).
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          {developmentName} — use gestos ou scroll para zoom. Toque ou clique em
          um lote para ver detalhes.
        </p>
      )}
      <ul
        className="flex flex-wrap gap-4 text-xs text-slate-600"
        role="list"
      >
        <li className="flex items-center gap-1">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-sm bg-green-500"
          />{" "}
          Disponível
        </li>
        <li className="flex items-center gap-1">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-sm bg-yellow-500"
          />{" "}
          Reservado
        </li>
        <li className="flex items-center gap-1">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-sm bg-slate-500"
          />{" "}
          Vendido
        </li>
        <li className="flex items-center gap-1">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-sm bg-red-500"
          />{" "}
          Indisponível
        </li>
      </ul>

      <div
        aria-label="Mapa interativo da planta do loteamento"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
        role="region"
      >
        <TransformWrapper
          centerOnInit
          initialScale={1}
          maxScale={5}
          minScale={0.3}
        >
          <TransformComponent
            contentClass="!flex items-center justify-center p-4"
            wrapperClass="!h-[min(70vh,720px)] !w-full"
          >
            <div
              ref={wrapRef}
              className="max-w-full [&_svg]:max-h-[min(65vh,680px)] [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {selected ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="font-medium text-slate-900">Lote {selected.code}</p>
          <p className="text-slate-600">
            Status: {selected.publicStatus}
            {selected.areaM2 ? (
              <>
                {" "}
                · Área: {selected.areaM2} m²
              </>
            ) : null}
            {selected.estimatedValue ? (
              <>
                {" "}
                · Valor estimado: R$ {selected.estimatedValue}
              </>
            ) : null}
            {!isPublic && selected.geometryRef ? (
              <>
                {" "}
                · Ref: <code>{selected.geometryRef}</code>
              </>
            ) : null}
          </p>
          {selected.publicNotes ? (
            <p className="mt-2 text-slate-700">{selected.publicNotes}</p>
          ) : null}
          {isPublic && whatsappDigits &&
          selected &&
          selected.geometryRef ? (
            <a
              className="mt-3 inline-flex rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                whatsappMessageForLot(
                  developmentName,
                  cityLabel,
                  selected,
                ),
              )}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Tenho interesse neste lote
            </a>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {isPublic
            ? "Selecione um lote na planta."
            : "Nenhum lote selecionado. Lotes sem geometryRef não aparecem na legenda de cores."}
        </p>
      )}
    </div>
  );
}
