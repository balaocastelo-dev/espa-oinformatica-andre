import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, requireAdmin } from "@/lib/auth";
import { readCompanySettings } from "@/lib/company";
import { OrderError, createOrder, listOrders, orderWhatsAppMessage } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lista de pedidos: somente para o painel administrativo.
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(await listOrders());
}

// Criação de pedido: pública (é o cliente finalizando o carrinho).
export async function POST(request: NextRequest) {
  if (!rateLimit(`order:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitos pedidos em sequência. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  try {
    const order = await createOrder(body);
    const company = await readCompanySettings({ fresh: true });
    const message = orderWhatsAppMessage(order);
    return NextResponse.json(
      {
        id: order.id,
        total: order.total,
        whatsappUrl: `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(message)}`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido" },
      { status: 500 }
    );
  }
}
