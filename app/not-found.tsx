import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <div className="text-6xl font-black text-[#E60012]">404</div>
      <h1 className="mt-3 text-2xl font-black">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">
        O produto ou página que você procura não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-[#E60012] px-6 py-3 text-sm font-bold text-white hover:bg-red-700"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}