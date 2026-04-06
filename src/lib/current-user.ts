import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

/** Registro do usuario logado na tabela `User` (por e-mail da sessao). */
export async function getCurrentDbUser() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) return null;
  return prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });
}

/** ID do usuario no banco (tabela `User`), para FK em `LotHistory`. */
export async function getCurrentDbUserId(): Promise<string | null> {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export function isSuperAdmin(role: UserRole) {
  return role === UserRole.SUPERADMIN;
}
