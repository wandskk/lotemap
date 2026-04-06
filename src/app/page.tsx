import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold">LoteMap</h1>
      <p className="mt-4 text-slate-700">
        Base inicial do MVP pronta. Proximo passo: iniciar o modulo admin.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          className="rounded-md bg-slate-900 px-4 py-2 text-white"
          href="/admin"
        >
          Ir para Admin
        </Link>
        <Link
          className="rounded-md border border-slate-300 px-4 py-2"
          href="/admin/login"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
