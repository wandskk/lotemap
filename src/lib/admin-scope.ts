import type { Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";

/** Quem pode ver/editar quais loteamentos (por `Development.companyId`). */
export type AdminDataScope =
  | { kind: "superadmin" }
  | { kind: "company"; companyId: string; companyName: string }
  | { kind: "blocked"; reason: "no_db_user" | "no_company" };

export async function getAdminDataScope(): Promise<AdminDataScope> {
  const u = await getCurrentDbUser();
  if (!u) return { kind: "blocked", reason: "no_db_user" };
  if (u.role === UserRole.SUPERADMIN) return { kind: "superadmin" };
  if (!u.companyId) return { kind: "blocked", reason: "no_company" };
  return {
    kind: "company",
    companyId: u.companyId,
    companyName: u.company?.name ?? "Empresa",
  };
}

export function developmentWhereForScope(
  scope: AdminDataScope,
): Prisma.DevelopmentWhereInput {
  if (scope.kind === "superadmin") return {};
  if (scope.kind === "company") return { companyId: scope.companyId };
  return { id: { in: [] } };
}

export function lotWhereForScope(scope: AdminDataScope): Prisma.LotWhereInput {
  if (scope.kind === "superadmin") return {};
  if (scope.kind === "company") {
    return { development: { companyId: scope.companyId } };
  }
  return { id: { in: [] } };
}

export async function assertDevelopmentAccessible(
  developmentId: string,
  scope: AdminDataScope,
): Promise<boolean> {
  if (scope.kind === "blocked") return false;
  if (scope.kind === "superadmin") {
    const d = await prisma.development.findUnique({
      where: { id: developmentId },
      select: { id: true },
    });
    return !!d;
  }
  const d = await prisma.development.findFirst({
    where: { id: developmentId, companyId: scope.companyId },
    select: { id: true },
  });
  return !!d;
}

export async function assertLotAccessible(
  lotId: string,
  scope: AdminDataScope,
): Promise<boolean> {
  if (scope.kind === "blocked") return false;
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: {
      id: true,
      development: { select: { companyId: true } },
    },
  });
  if (!lot) return false;
  if (scope.kind === "superadmin") return true;
  return lot.development.companyId === scope.companyId;
}
