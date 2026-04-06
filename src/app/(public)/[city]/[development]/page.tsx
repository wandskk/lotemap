type PublicDevelopmentPageProps = {
  params: Promise<{
    city: string;
    development: string;
  }>;
};

export default async function PublicDevelopmentPage({
  params,
}: PublicDevelopmentPageProps) {
  const { city, development } = await params;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Landing pública do loteamento</h1>
      <p className="mt-3 text-slate-700">
        Rota: /{city}/{development}
      </p>
    </main>
  );
}
