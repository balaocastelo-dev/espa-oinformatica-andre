import { readDoc, updateDoc } from "@/lib/storage";
import { formatPrice, parsePriceToNumber } from "@/lib/format";
import { readProducts } from "@/lib/store";

import {
  ORDER_STATUSES,
  type Order,
  type OrderItem,
  type OrderStatus,
} from "@/lib/order-types";

export { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-types";
export type { Order, OrderItem, OrderStatus } from "@/lib/order-types";

type StoredOrder = Omit<Order, "total">;

/** Todos os pedidos ficam em um documento; "seq" é o último número usado. */
type OrdersDoc = { seq: number; orders: StoredOrder[] };

const FIRST_ORDER_NUMBER = 1001;

function emptyDoc(): OrdersDoc {
  return { seq: FIRST_ORDER_NUMBER - 1, orders: [] };
}

function normalizeDoc(doc: OrdersDoc | null): OrdersDoc {
  if (!doc || !Array.isArray(doc.orders)) return emptyDoc();
  return { seq: Number(doc.seq) || FIRST_ORDER_NUMBER - 1, orders: doc.orders };
}

function toOrder(stored: StoredOrder): Order {
  const status = (ORDER_STATUSES as readonly string[]).includes(stored.status)
    ? stored.status
    : "novo";
  return {
    ...stored,
    status,
    items: Array.isArray(stored.items) ? stored.items : [],
    total: formatPrice(stored.totalCents / 100),
  };
}

export class OrderError extends Error {}

function cleanText(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export type NewOrderInput = {
  customerName?: unknown;
  customerPhone?: unknown;
  note?: unknown;
  items?: unknown;
};

/**
 * Cria o pedido usando nome e preço do catálogo (o que o navegador envia é
 * só o id e a quantidade), para o valor gravado ser sempre o valor real.
 */
export async function createOrder(input: NewOrderInput): Promise<Order> {
  const customerName = cleanText(input.customerName, 80);
  const customerPhone = cleanText(input.customerPhone, 30);
  const note = cleanText(input.note, 500);

  if (customerName.length < 2) throw new OrderError("Informe seu nome");
  const digits = customerPhone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    throw new OrderError("Informe um telefone/WhatsApp válido com DDD");
  }

  const rawItems = Array.isArray(input.items) ? input.items : [];
  if (rawItems.length === 0) throw new OrderError("Seu carrinho está vazio");
  if (rawItems.length > 50) throw new OrderError("Pedido com itens demais");

  const catalog = await readProducts({ fresh: true });
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const quantities = new Map<string, number>();
  for (const raw of rawItems) {
    const id = String((raw as { id?: unknown })?.id ?? "");
    const quantity = Math.floor(Number((raw as { quantity?: unknown })?.quantity));
    if (!id || !Number.isFinite(quantity) || quantity < 1) continue;
    quantities.set(id, Math.min(99, (quantities.get(id) ?? 0) + quantity));
  }

  const items: OrderItem[] = [];
  const missing: string[] = [];
  for (const [id, quantity] of quantities) {
    const product = byId.get(id);
    if (!product) {
      missing.push(id);
      continue;
    }
    items.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      unitCents: Math.round(parsePriceToNumber(product.price) * 100),
      quantity,
      image: product.image,
    });
  }

  if (items.length === 0) {
    throw new OrderError(
      "Os produtos do carrinho não estão mais disponíveis. Atualize a página e tente novamente."
    );
  }

  const totalCents = items.reduce((sum, item) => sum + item.unitCents * item.quantity, 0);
  const now = new Date().toISOString();

  const created = await updateDoc<OrdersDoc, StoredOrder>("orders", (current) => {
    const doc = normalizeDoc(current);
    const order: StoredOrder = {
      id: doc.seq + 1,
      createdAt: now,
      updatedAt: now,
      status: "novo",
      customerName,
      customerPhone,
      note,
      items,
      totalCents,
    };
    return {
      value: { seq: order.id, orders: [...doc.orders, order] },
      result: order,
    };
  });

  return toOrder(created);
}

export async function listOrders(limit = 500): Promise<Order[]> {
  const doc = normalizeDoc((await readDoc<OrdersDoc>("orders", { fresh: true })).value);
  return doc.orders
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
    .map(toOrder);
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<Order | null> {
  const updated = await updateDoc<OrdersDoc, StoredOrder | null>("orders", (current) => {
    const doc = normalizeDoc(current);
    let found: StoredOrder | null = null;
    const orders = doc.orders.map((order) => {
      if (order.id !== id) return order;
      found = { ...order, status, updatedAt: new Date().toISOString() };
      return found;
    });
    return { value: { seq: doc.seq, orders }, result: found };
  });
  return updated ? toOrder(updated) : null;
}

export async function deleteOrder(id: number): Promise<boolean> {
  return updateDoc<OrdersDoc, boolean>("orders", (current) => {
    const doc = normalizeDoc(current);
    const orders = doc.orders.filter((order) => order.id !== id);
    return {
      value: { seq: doc.seq, orders },
      result: orders.length !== doc.orders.length,
    };
  });
}

/** Texto do pedido que vai pronto para o WhatsApp da loja. */
export function orderWhatsAppMessage(order: Order): string {
  const lines = order.items.map(
    (item, index) =>
      `${index + 1}. ${item.name}\n   Qtd: ${item.quantity} x ${item.price}`
  );
  const parts = [
    `Olá! Meu nome é ${order.customerName} e acabei de fazer o pedido #${order.id} pelo site:`,
    "",
    lines.join("\n\n"),
    "",
    `Total: ${order.total}`,
    `Telefone: ${order.customerPhone}`,
  ];
  if (order.note) parts.push(`Observação: ${order.note}`);
  return parts.join("\n");
}
