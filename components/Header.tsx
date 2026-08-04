"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompany } from "@/context/CompanyContext";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartCount } = useCart();
  const company = useCompany();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Apple", href: "/?category=Apple" },
    { label: "Dell", href: "/?category=Dell" },
    { label: "HP", href: "/?category=HP" },
    { label: "Lenovo", href: "/?category=Lenovo" },
    { label: "Serviços", href: "/#servicos" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button
          className="min-h-10 min-w-10 shrink-0 rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="relative block h-11 w-11 flex-none">
            <Image
              src={company.logoPath}
              alt={company.name}
              width={44}
              height={44}
              className="h-full w-full object-contain"
            />
          </span>
          <span className="hidden min-w-0 leading-tight min-[400px]:block">
            <span className="block truncate text-sm font-black tracking-tight text-slate-900">
              {company.name}
            </span>
            <span className="hidden text-[11px] text-slate-500 sm:block">
              {company.tagline}
            </span>
          </span>
        </Link>

        <form
          onSubmit={submitSearch}
          className="mx-auto hidden max-w-md flex-1 items-center sm:flex"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar notebook, SSD, acessório..."
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-800 outline-none focus:border-[#E60012] focus:ring-2 focus:ring-red-100"
          />
          <button
            type="submit"
            className="-ml-10 rounded-full p-2 text-slate-500 hover:text-[#E60012]"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>
        </form>

        <nav className="ml-auto hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-[#E60012]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="relative ml-auto flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:px-4 lg:ml-0"
        >
          <ShoppingCart size={18} />
          <span className="hidden sm:inline">Carrinho</span>
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E60012] px-1 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-3">
            <form onSubmit={submitSearch} className="mb-2 flex items-center">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="-ml-10 p-2 text-slate-500"
                aria-label="Buscar"
              >
                <Search size={18} />
              </button>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block min-h-10 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
