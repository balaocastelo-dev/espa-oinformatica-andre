"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { parsePriceToNumber } from "@/lib/format";
import type { Product } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const price = parsePriceToNumber(product.price);
  const installment = price / 10;

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 sm:p-4"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {product.category}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-slate-800 hover:text-[#E60012]"
        >
          {product.name}
        </Link>

        <div className="mt-2">
          <div className="text-base font-black text-slate-900 sm:text-lg">{product.price}</div>
          <div className="text-[10px] leading-snug text-slate-500 sm:text-xs">
            ou 10x de R$ {(installment / 10).toFixed(2)} sem juros
          </div>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="mt-3 flex min-h-10 w-full items-center justify-center gap-1 rounded-full bg-[#E60012] px-2 py-2.5 text-[11px] font-bold text-white transition hover:bg-red-700 active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <ShoppingCart size={16} />
          Adicionar ao carrinho
        </button>

        <div className="mt-2 flex items-start justify-center gap-1 text-center text-[10px] leading-snug text-slate-500 sm:items-center sm:text-[11px]">
          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500 sm:mt-0" />
          Garantia e revisão inclusas
        </div>
      </div>
    </div>
  );
}
