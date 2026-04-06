import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Entrar no painel</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use o usuario bootstrap definido no arquivo .env.local.
      </p>

      <form
        className="mt-8 space-y-4"
        action={async (formData) => {
          "use server";
          await signIn("credentials", formData);
        }}
      >
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            id="email"
            name="email"
            type="email"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="password">
            Senha
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            id="password"
            name="password"
            type="password"
            required
          />
        </div>

        <button
          className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
