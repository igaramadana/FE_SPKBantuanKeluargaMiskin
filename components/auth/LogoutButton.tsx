"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  className?: string;
  iconClassName?: string;
  label?: string;
};

export function LogoutButton({
  className,
  iconClassName,
  label = "Keluar",
}: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl: "/login",
        })
      }
      className={
        className ||
        "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
      }
    >
      <LogOut
        className={
          iconClassName ||
          "h-5 w-5 text-slate-400 transition group-hover:text-red-600"
        }
      />
      {label}
    </button>
  );
}