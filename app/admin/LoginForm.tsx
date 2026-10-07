"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function LoginForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error ? String(data.error) : "Não foi possível entrar");
    } catch {
      setError("Sem conexão com o servidor");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-100 px-4 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#E60012]">
          <Lock size={24} />
        </div>
        <h1 className="mt-4 text-center text-xl font-black">Painel Administrativo</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Acesso restrito à equipe da loja.
        </p>

        {!configured && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            O painel está bloqueado porque a senha ainda não foi configurada no
            servidor (variável <strong>ADMIN_PASSWORD</strong>).
          </p>
        )}

        <label htmlFor="admin-password" className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Senha
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          disabled={!configured}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#E60012] focus:bg-white disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!configured || loading || !password}
          className="mt-5 w-full rounded-full bg-[#E60012] px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
