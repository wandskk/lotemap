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
  number?: string;
  blockCode?: string;
};

function publicStatusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Disponível";
    case "RESERVED":
      return "Reservado";
    case "SOLD":
      return "Vendido";
    case "UNAVAILABLE":
      return "Indisponível";
    default:
      return status;
  }
}

function formatBrlFromDecimalString(value: string): string {
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

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

function findLotFromElement(
  startNode: Element | null,
  lots: MapLotForPreview[],
): MapLotForPreview | null {
  let node: Element | null = startNode;
  for (let i = 0; i < 12 && node; i++) {
    const id = node.getAttribute("id");
    const dataId = node.getAttribute("data-lot-id");
    const ref = dataId ?? id;
    if (ref) {
      const lot = lots.find((l) => l.geometryRef === ref);
      if (lot) return lot;
    }
    node = node.parentElement;
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
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(
    null,
  );
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

    const TAP_MAX_PX = 14;
    const TAP_MAX_MS = 450;

    const onClick = (e: MouseEvent) => {
      const lot = findLotFromElement(e.target as Element | null, lots);
      if (lot) setSelectedId(lot.id);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touchStartRef.current = null;
        return;
      }
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || e.changedTouches.length !== 1) return;
      const t = e.changedTouches[0];
      if (Date.now() - start.t > TAP_MAX_MS) return;
      if (
        Math.abs(t.clientX - start.x) > TAP_MAX_PX ||
        Math.abs(t.clientY - start.y) > TAP_MAX_PX
      ) {
        return;
      }

      const fromTarget = findLotFromElement(e.target as Element | null, lots);
      if (fromTarget) {
        setSelectedId(fromTarget.id);
        return;
      }

      const top = document.elementFromPoint(t.clientX, t.clientY);
      if (!top || !root.contains(top)) return;

      const lot = findLotFromElement(top, lots);
      if (lot) setSelectedId(lot.id);
    };

    root.addEventListener("click", onClick);
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchend", onTouchEnd);
    };
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

  useEffect(() => {
    if (!isPublic || !selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPublic, selectedId]);

  useEffect(() => {
    if (!isPublic || !selectedId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isPublic, selectedId]);

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
          {developmentName} — a roda do mouse rola a página normalmente. Para
          dar zoom na planta, use <strong>Ctrl + roda</strong> (ou pinça no
          celular). Clique em um lote para ver detalhes.
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
          wheel={
            isPublic
              ? {
                  // Zoom com roda só com Ctrl (ou gesto com ctrlKey); scroll normal não fica preso no mapa.
                  wheelDisabled: true,
                }
              : undefined
          }
        >
          <TransformComponent
            contentClass="!flex items-center justify-center p-4"
            wrapperClass="!h-[min(70vh,720px)] !w-full"
          >
            <div
              ref={wrapRef}
              className="max-w-full touch-manipulation [&_svg]:max-h-[min(65vh,680px)] [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {!isPublic && selected ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="font-medium text-slate-900">Lote {selected.code}</p>
          <p className="text-slate-600">
            Status: {publicStatusLabel(selected.publicStatus)}
            {selected.areaM2 ? (
              <>
                {" "}
                · Área: {selected.areaM2} m²
              </>
            ) : null}
            {selected.estimatedValue ? (
              <>
                {" "}
                · Valor estimado:{" "}
                {formatBrlFromDecimalString(selected.estimatedValue)}
              </>
            ) : null}
            {selected.geometryRef ? (
              <>
                {" "}
                · Ref: <code>{selected.geometryRef}</code>
              </>
            ) : null}
          </p>
          {selected.publicNotes ? (
            <p className="mt-2 text-slate-700">{selected.publicNotes}</p>
          ) : null}
        </div>
      ) : !isPublic ? (
        <p className="text-sm text-slate-500">
          Nenhum lote selecionado. Lotes sem geometryRef não aparecem na legenda
          de cores.
        </p>
      ) : null}

      {isPublic && !selected ? (
        <p className="text-sm text-slate-500">
          Selecione um lote na planta para ver os detalhes.
        </p>
      ) : null}

      {isPublic && selected ? (
        <div
          aria-labelledby="lot-modal-title"
          className="fixed inset-0 z-100 flex items-end justify-center sm:items-center"
          role="presentation"
        >
          <button
            aria-label="Fechar detalhes do lote"
            className="absolute inset-0 bg-slate-900/50"
            type="button"
            onClick={() => setSelectedId(null)}
          />
          <div
            className="relative z-101 m-0 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            id="lot-detail-modal"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-lg font-semibold text-slate-900"
                  id="lot-modal-title"
                >
                  Lote {selected.code}
                </h3>
                {selected.number ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Número: <span className="font-medium">{selected.number}</span>
                    {selected.blockCode ? (
                      <>
                        {" "}
                        · Quadra:{" "}
                        <span className="font-medium">{selected.blockCode}</span>
                      </>
                    ) : null}
                  </p>
                ) : selected.blockCode ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Quadra:{" "}
                    <span className="font-medium">{selected.blockCode}</span>
                  </p>
                ) : null}
              </div>
              <button
                className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={() => setSelectedId(null)}
              >
                Fechar
              </button>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900">
                  {publicStatusLabel(selected.publicStatus)}
                </dd>
              </div>
              {selected.areaM2 ? (
                <div>
                  <dt className="text-slate-500">Área</dt>
                  <dd className="font-medium text-slate-900">
                    {selected.areaM2} m²
                  </dd>
                </div>
              ) : null}
              {selected.estimatedValue ? (
                <div>
                  <dt className="text-slate-500">Valor estimado</dt>
                  <dd className="font-medium text-slate-900">
                    {formatBrlFromDecimalString(selected.estimatedValue)}
                  </dd>
                </div>
              ) : null}
              {selected.publicNotes ? (
                <div>
                  <dt className="text-slate-500">Observações</dt>
                  <dd className="whitespace-pre-wrap text-slate-800">
                    {selected.publicNotes}
                  </dd>
                </div>
              ) : null}
            </dl>

            {whatsappDigits ? (
              <a
                className="mt-6 flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
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
        </div>
      ) : null}
    </div>
  );
}
