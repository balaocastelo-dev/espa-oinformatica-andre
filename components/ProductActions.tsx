"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/format";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        addToCart(product);
        router.push("/cart");
      }}
      className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#E60012] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95 sm:px-6"
    >
      <ShoppingCart size={18} />
      Adicionar ao carrinho
    </button>
  );
}
