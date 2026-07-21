"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setLoading(false);
      setError("Incorrect email or password");
      return;
    }

    const session = await getSession();
    const role = (session?.user as any)?.role;
    setLoading(false);

    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push(next || "/");
    }
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-neutral-500">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black px-3 py-2 mt-1 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-neutral-500">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-black px-3 py-2 mt-1 text-sm" />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-neutral-500 mt-6">
        No account? <a href="/signup" className="underline">Sign up</a>
      </p>
    </div>
  );
}