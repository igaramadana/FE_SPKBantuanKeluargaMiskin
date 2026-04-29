"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
    async function handleLogout() {
        await signOut({
            callbackUrl: "/login",
        })
    }

    return (
        <button onClick={handleLogout} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
            Logout
        </button>
    );
}