"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/cities", label: "Cidades" },
  { href: "/admin/developments", label: "Loteamentos" },
  { href: "/admin/blocks", label: "Quadras" },
  { href: "/admin/lots", label: "Lotes" },
  { href: "/admin/users", label: "Usuários" },
];

function navLinkIsActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDashboardNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Menu principal do painel">
      <ul className="flex w-max flex-nowrap items-center gap-2 text-sm sm:w-auto sm:flex-wrap">
        {navItems.map((item) => {
          const active = navLinkIsActive(pathname, item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "block whitespace-nowrap rounded-md bg-slate-200 px-3 py-2 font-medium text-slate-900"
                    : "block whitespace-nowrap rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                }
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
