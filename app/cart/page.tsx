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
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: number | null; whatsappUrl: string } | null>(
    null
  );

  // Usado só se o registro do pedido falhar: o cliente não fica sem atendimento.
  const fallbackWhatsAppUrl = () => {
    const lines = items.map(
      (item, index) =>
        `${index + 1}. ${item.name}\n   Qtd: ${item.quantity} x ${item.price}`
    );
    const text =
      `Olá! Meu nome é ${customerName.trim()} e gostaria de finalizar meu pedido:\n\n` +
      lines.join("\n\n") +
      `\n\nTotal: ${formatPrice(cartTotal)}\nTelefone: ${customerPhone.trim()}`;
    return `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setError(null);

    if (customerName.trim().length < 2) {
      setError("Informe seu nome para finalizar o pedido.");
      return;
    }
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      setError("Informe seu WhatsApp com DDD. Ex.: (19) 99999-9999");
      return;
    }

    // Abre a aba já no clique (antes do await) para o navegador não bloquear.
    const popup = window.open("about:blank", "_blank");
    setSending(true);

    let whatsappUrl = "";
    let orderId: number | null = null;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          note,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 400 && data?.error) {
        popup?.close();
        setError(String(data.error));
        setSending(false);
        return;
      }
      if (res.ok && data?.whatsappUrl) {
        whatsappUrl = String(data.whatsappUrl);
        orderId = Number(data.id) || null;
      }
    } catch {
      /* sem conexão com o servidor: segue pelo WhatsApp mesmo assim */
    }

    if (!whatsappUrl) whatsappUrl = fallbackWhatsAppUrl();

    if (popup && !popup.closed) {
      popup.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }

    setDone({ id: orderId, whatsappUrl });
    clearCart();
    setSending(false);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="mt-5 text-2xl font-black">
            {done.id ? `Pedido #${done.id} registrado!` : "Pedido preparado!"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Para concluir, envie a mensagem que abrimos no WhatsApp. Nossa equipe
            confirma disponibilidade, pagamento e retirada/entrega por lá.
          </p>
          <a
            href={done.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
          >
            <MessageCircle size={18} />
            Abrir o WhatsApp novamente
          </a>
          <div>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#E60012]"
            >
              Voltar ao catálogo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

          <form onSubmit={submitOrder} noValidate>
            <div className="mt-5 space-y-3">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                maxLength={80}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#E60012]"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Seu WhatsApp com DDD"
                autoComplete="tel"
                maxLength={30}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#E60012]"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Observação (opcional)"
                rows={2}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#E60012]"
              />
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="balao-cta-pulse mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60"
            >
              <MessageCircle size={18} />
              {sending ? "Registrando pedido..." : "Finalizar pedido no WhatsApp"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Confirmação de disponibilidade, valores e retirada/entrega feita
            diretamente com a loja.
          </p>
        </div>
      </div>
    </div>
  );
}
