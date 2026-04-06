import type {
  InternalLotStatus,
  Lot,
  PublicLotStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type LotCrudSnapshot = {
  blockId: string;
  code: string;
  number: string;
  publicStatus: PublicLotStatus;
  internalStatus: InternalLotStatus;
  areaM2: string | null;
  estimatedValue: string | null;
  manualValue: string | null;
  publicNotes: string | null;
  internalNotes: string | null;
  geometryRef: string | null;
  visiblePublicly: boolean;
  isFeatured: boolean;
};

export function lotCrudSnapshotFromModel(lot: Lot): LotCrudSnapshot {
  return {
    blockId: lot.blockId,
    code: lot.code,
    number: lot.number,
    publicStatus: lot.publicStatus,
    internalStatus: lot.internalStatus,
    areaM2: lot.areaM2 != null ? String(lot.areaM2) : null,
    estimatedValue:
      lot.estimatedValue != null ? String(lot.estimatedValue) : null,
    manualValue: lot.manualValue != null ? String(lot.manualValue) : null,
    publicNotes: lot.publicNotes,
    internalNotes: lot.internalNotes,
    geometryRef: lot.geometryRef,
    visiblePublicly: lot.visiblePublicly,
    isFeatured: lot.isFeatured,
  };
}

export function lotCrudSnapshotFromParsedUpdate(data: {
  blockId: string;
  code: string;
  number: string;
  publicStatus: PublicLotStatus;
  internalStatus: InternalLotStatus;
  areaM2: Prisma.Decimal | null;
  estimatedValue: Prisma.Decimal | null;
  manualValue: Prisma.Decimal | null;
  publicNotes: string | null;
  internalNotes: string | null;
  geometryRef: string | null;
  visiblePublicly: boolean;
  isFeatured: boolean;
}): LotCrudSnapshot {
  return {
    blockId: data.blockId,
    code: data.code,
    number: data.number,
    publicStatus: data.publicStatus,
    internalStatus: data.internalStatus,
    areaM2: data.areaM2 != null ? String(data.areaM2) : null,
    estimatedValue:
      data.estimatedValue != null ? String(data.estimatedValue) : null,
    manualValue: data.manualValue != null ? String(data.manualValue) : null,
    publicNotes: data.publicNotes,
    internalNotes: data.internalNotes,
    geometryRef: data.geometryRef,
    visiblePublicly: data.visiblePublicly,
    isFeatured: data.isFeatured,
  };
}

export function lotCrudSnapshotsEqual(a: LotCrudSnapshot, b: LotCrudSnapshot) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function createLotHistoryEntry(params: {
  lotId: string;
  userId: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  await prisma.lotHistory.create({
    data: {
      lotId: params.lotId,
      userId: params.userId,
      action: params.action,
      previousValue:
        params.previousValue === undefined
          ? Prisma.JsonNull
          : (params.previousValue as Prisma.InputJsonValue),
      newValue:
        params.newValue === undefined
          ? Prisma.JsonNull
          : (params.newValue as Prisma.InputJsonValue),
    },
  });
}
