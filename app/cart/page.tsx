"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompany } from "@/context/CompanyContext";
import { formatPrice, parsePriceToNumber } from "@/lib/format";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const company = useCompany();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sent, setSent] = useState(false);

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      (item, index) =>
        `${index + 1}. ${item.name}\n   Qtd: ${item.quantity} x ${item.price}`
    );
    const intro = customerName
      ? `Olá! Meu nome é ${customerName} e gostaria de finalizar meu pedido:\n\n`
      : "Olá! Gostaria de finalizar meu pedido:\n\n";
    const footer = `\n\nTotal: ${formatPrice(cartTotal)}`;
    return encodeURIComponent(intro + lines.join("\n\n") + footer);
  };

  const whatsappUrl = `https://wa.me/${company.whatsappNumber}?text=${buildWhatsAppMessage()}`;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingBag size={36} />
          </div>
          <h1 className="mt-5 text-2xl font-black">Seu carrinho está vazio</h1>
          <p className="mt-2 text-sm text-slate-500">
            Aproveite nossos notebooks seminovos e acessórios com garantia.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E60012] px-6 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Ver catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <ShoppingBag className="text-[#E60012]" />
        Meu carrinho
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {items.map((item) => {
            const price = parsePriceToNumber(item.price);
            return (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:gap-4 sm:p-4"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-[#E60012]"
                  >
                    {item.name}
                  </Link>
                  <span className="mt-1 text-xs text-slate-500">
                    {item.category}
                  </span>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center gap-1 rounded-full border border-slate-200">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2.5 text-slate-500 hover:text-[#E60012]"
                        aria-label="Diminuir"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2.5 text-slate-500 hover:text-[#E60012]"
                        aria-label="Aumentar"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">
                        {formatPrice(price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600"
                        aria-label="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja limpar o carrinho?")) {
                clearCart();
              }
            }}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Limpar carrinho
          </button>
        </div>

        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-black">Resumo do pedido</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <span className="text-emerald-600">A combinar</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-black">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Seu nome (opcional)"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#E60012]"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Seu telefone (opcional)"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#E60012]"
            />
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setSent(true)}
            className="balao-cta-pulse mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white"
          >
            <MessageCircle size={18} />
            Finalizar pedido no WhatsApp
          </a>

          {sent && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-emerald-600">
              <CheckCircle2 size={14} />
              Pedido preparado! Finalize a conversa no WhatsApp.
            </p>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            Confirmação de disponibilidade, valores e retirada/entrega feita
            diretamente com a loja.
          </p>
        </div>
      </div>
    </div>
  );
}
