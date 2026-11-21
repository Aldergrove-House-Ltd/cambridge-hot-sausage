"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Lock } from "lucide-react";
import { login } from "@/lib/admin/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      await login(
        form.get("username") as string,
        form.get("password") as string,
      );
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message.includes("401") ? "Invalid credentials." : err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#5A1F1F] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECD691] shadow-lg">
            <Box size={24} className="text-[#5A1F1F]" strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-rye)] text-2xl text-[#F5F1E8]">
            Admin
          </h1>
          <p className="mt-1 text-sm text-white/50">The Hot Sausage Company</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                autoComplete="username"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-[border-color,box-shadow] duration-200 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-[border-color,box-shadow] duration-200 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5A1F1F] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#4a1919] disabled:opacity-50"
          >
            <Lock size={14} />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
