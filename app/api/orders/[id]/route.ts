import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, deleteOrder, updateOrderStatus, type OrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: NextRequest, props: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = parseId((await props.params).id);
  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "");
  if (!id || !(ORDER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const order = await updateOrderStatus(id, status as OrderStatus);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function DELETE(request: NextRequest, props: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = parseId((await props.params).id);
  if (!id || !await deleteOrder(id)) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
