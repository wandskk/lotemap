import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, UserRole } from "@prisma/client";
import { AdminCallout } from "@/components/admin/admin-callout";
import { getCurrentDbUser, isSuperAdmin } from "@/lib/current-user";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const ROLE_OPTIONS: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
];

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: "Superadmin",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MANAGER]: "Gestor",
};

type UsersPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const me = await getCurrentDbUser();
  const sp = await searchParams;
  const err = sp.error;

  if (!me) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <AdminCallout variant="warning">
          Seu e-mail de login não está cadastrado na tabela de usuários. Rode o
          seed ou peça acesso a um administrador.
        </AdminCallout>
      </section>
    );
  }

  if (!isSuperAdmin(me.role)) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <AdminCallout variant="warning">
          Apenas usuários com perfil <strong>Superadmin</strong> podem gerenciar
          cadastros de usuário. Entre com a conta definida no seed ou peça
          elevação de perfil.
        </AdminCallout>
        <p className="text-sm text-slate-600">
          <Link className="underline" href="/admin">
            Voltar ao painel
          </Link>
        </p>
      </section>
    );
  }

  const [userRows, companies] = await Promise.all([
    prisma.user.findMany({
      include: { company: true },
      orderBy: [{ active: "desc" }, { email: "asc" }],
    }),
    prisma.company.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const users = userRows.map(({ passwordHash: _ph, ...rest }) => ({
    ...rest,
    hasPassword: !!_ph,
  }));

  async function createUser(formData: FormData) {
    "use server";
    const actor = await getCurrentDbUser();
    if (!actor || !isSuperAdmin(actor.role)) return;

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = String(formData.get("role") ?? UserRole.MANAGER) as UserRole;
    const companyRaw = String(formData.get("companyId") ?? "").trim();
    const companyId = companyRaw || null;
    const active = formData.get("active") === "on";
    const passwordRaw = String(formData.get("password") ?? "").trim();

    if (!name || !email) {
      redirect("/admin/users?error=invalid");
    }
    if (!ROLE_OPTIONS.includes(role)) return;
    if (passwordRaw.length < 6) {
      redirect("/admin/users?error=password_weak");
    }

    const passwordHash = await hashPassword(passwordRaw);

    try {
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          active,
          ...(companyId
            ? { company: { connect: { id: companyId } } }
            : {}),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        redirect("/admin/users?error=duplicate_email");
      }
      throw e;
    }
    revalidatePath("/admin/users");
    redirect("/admin/users");
  }

  async function updateUser(formData: FormData) {
    "use server";
    const actor = await getCurrentDbUser();
    if (!actor || !isSuperAdmin(actor.role)) return;

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = String(formData.get("role") ?? UserRole.MANAGER) as UserRole;
    const companyRaw = String(formData.get("companyId") ?? "").trim();
    const companyId = companyRaw || null;
    const active = formData.get("active") === "on";
    const newPasswordRaw = String(formData.get("newPassword") ?? "").trim();

    if (!id || !name || !email) {
      redirect("/admin/users?error=invalid");
    }
    if (!ROLE_OPTIONS.includes(role)) return;
    if (newPasswordRaw.length > 0 && newPasswordRaw.length < 6) {
      redirect("/admin/users?error=password_weak");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) redirect("/admin/users");

    const otherSuperAdmins = await prisma.user.count({
      where: {
        id: { not: id },
        role: UserRole.SUPERADMIN,
        active: true,
      },
    });
    if (existing.role === UserRole.SUPERADMIN) {
      if (role !== UserRole.SUPERADMIN && otherSuperAdmins === 0) {
        redirect("/admin/users?error=last_superadmin");
      }
      if (
        !active &&
        role === UserRole.SUPERADMIN &&
        otherSuperAdmins === 0
      ) {
        redirect("/admin/users?error=last_superadmin");
      }
    }

    try {
      await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          role,
          active,
          company: companyId
            ? { connect: { id: companyId } }
            : { disconnect: true },
          ...(newPasswordRaw.length >= 6
            ? { passwordHash: await hashPassword(newPasswordRaw) }
            : {}),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        redirect("/admin/users?error=duplicate_email");
      }
      throw e;
    }
    revalidatePath("/admin/users");
    redirect("/admin/users");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const actor = await getCurrentDbUser();
    if (!actor || !isSuperAdmin(actor.role)) return;

    const id = String(formData.get("id") ?? "");
    if (!id) redirect("/admin/users");

    if (id === actor.id) {
      redirect("/admin/users?error=self");
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) redirect("/admin/users");

    if (target.role === UserRole.SUPERADMIN && target.active) {
      const otherSuperAdmins = await prisma.user.count({
        where: {
          id: { not: id },
          role: UserRole.SUPERADMIN,
          active: true,
        },
      });
      if (otherSuperAdmins === 0) {
        redirect("/admin/users?error=last_superadmin");
      }
    }

    const hist = await prisma.lotHistory.count({ where: { userId: id } });
    if (hist > 0) {
      redirect("/admin/users?error=has_history");
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    redirect("/admin/users");
  }

  const errorMessage =
    err === "duplicate_email"
      ? "Já existe um usuário com este e-mail."
      : err === "has_history"
        ? "Não é possível remover um usuário que já registrou histórico de lotes."
        : err === "self"
          ? "Você não pode remover a própria conta."
          : err === "last_superadmin"
            ? "Deve existir pelo menos um superadmin ativo. Promova outro usuário antes."
            : err === "invalid"
              ? "Preencha nome e e-mail válidos."
              : err === "password_weak"
                ? "A senha deve ter pelo menos 6 caracteres."
                : null;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="mt-2 text-slate-700">
          Cada usuário recebe <strong>senha</strong> (armazenada com hash).
          Quem tem senha no banco entra só com e-mail + senha. O seed grava
          senha a partir de <code className="text-sm">ADMIN_PASSWORD</code> no{" "}
          <code className="text-sm">.env</code> para o admin inicial.
        </p>
      </div>

      {errorMessage ? (
        <AdminCallout variant="error">{errorMessage}</AdminCallout>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Novo usuário</h2>
        <form action={createUser} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Nome</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="name"
              placeholder="Nome completo"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">E-mail</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              name="email"
              placeholder="email@empresa.com"
              required
              type="email"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Perfil</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              defaultValue={UserRole.MANAGER}
              name="role"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Empresa</span>
            <select className="rounded-md border border-slate-300 px-3 py-2" name="companyId">
              <option value="">Nenhuma</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Senha inicial</span>
            <input
              autoComplete="new-password"
              className="rounded-md border border-slate-300 px-3 py-2"
              minLength={6}
              name="password"
              placeholder="Mínimo 6 caracteres"
              required
              type="password"
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input defaultChecked name="active" type="checkbox" />
            <span className="font-medium text-slate-700">Ativo</span>
          </label>
          <button
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white sm:col-span-2 sm:w-max"
            type="submit"
          >
            Criar usuário
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-medium">Lista de usuários</h2>
        </div>
        <div className="p-5">
          {users.length === 0 ? (
            <AdminCallout variant="neutral">Nenhum usuário cadastrado.</AdminCallout>
          ) : (
            <div className="space-y-6">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <form action={updateUser} className="grid gap-3 sm:grid-cols-2">
                    <input name="id" type="hidden" value={u.id} />
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">Nome</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={u.name}
                        name="name"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">E-mail</span>
                      <input
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={u.email}
                        name="email"
                        required
                        type="email"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Perfil</span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={u.role}
                        name="role"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-700">Empresa</span>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2"
                        defaultValue={u.companyId ?? ""}
                        name="companyId"
                      >
                        <option value="">Nenhuma</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">
                        Nova senha (opcional)
                      </span>
                      <input
                        autoComplete="new-password"
                        className="rounded-md border border-slate-300 px-3 py-2"
                        minLength={6}
                        name="newPassword"
                        placeholder={
                          u.hasPassword
                            ? "Deixe em branco para manter a atual"
                            : "Defina uma senha (mín. 6 caracteres)"
                        }
                        type="password"
                      />
                    </label>
                    <p className="text-xs text-slate-500 sm:col-span-2">
                      {u.hasPassword
                        ? "Senha de login cadastrada no sistema."
                        : "Sem senha no banco: use o fluxo bootstrap do .env se for o e-mail admin."}
                    </p>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input defaultChecked={u.active} name="active" type="checkbox" />
                      <span className="font-medium text-slate-700">Ativo</span>
                    </label>
                    <button
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm sm:col-span-2 sm:w-max"
                      type="submit"
                    >
                      Salvar
                    </button>
                  </form>
                  <form action={deleteUser} className="mt-3">
                    <input name="id" type="hidden" value={u.id} />
                    <button
                      className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={u.id === me.id}
                      title={
                        u.id === me.id
                          ? "Não é possível remover a própria sessão"
                          : undefined
                      }
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
