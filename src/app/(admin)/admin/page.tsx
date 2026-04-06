import { auth, signOut } from "@/auth";

export default async function AdminHomePage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel administrativo</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            Sair
          </button>
        </form>
      </div>

      <p className="mt-4 text-slate-700">
        Usuario autenticado: {session?.user?.email ?? "desconhecido"}
      </p>
    </main>
  );
}
