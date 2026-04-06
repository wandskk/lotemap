import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboardNav } from "@/components/admin/admin-dashboard-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { getSession } from "@/lib/get-session";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link className="shrink-0 text-lg font-semibold" href="/admin">
              LoteMap Admin
            </Link>
            <div className="min-w-0 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:pb-0">
              <AdminDashboardNav />
            </div>
          </div>

          <div className="shrink-0 sm:pl-2">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
