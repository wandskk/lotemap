"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sair
    </button>
  );
}
