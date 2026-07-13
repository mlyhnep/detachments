"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-800 bg-gray-900 p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Sign in</h1>

        <form action={action} className="flex flex-col gap-4">
          {state?.error && (
            <p className="rounded bg-red-900/50 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
