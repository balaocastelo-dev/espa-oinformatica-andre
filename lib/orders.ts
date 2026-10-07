import { getDb } from "@/lib/db";
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

type OrderRow = {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  note: string;
  items: string;
  total_cents: number;
};

function toOrder(row: OrderRow): Order {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(row.items) as OrderItem[];
  } catch {
    items = [];
  }
  const status = (ORDER_STATUSES as readonly string[]).includes(row.status)
    ? (row.status as OrderStatus)
    : "novo";
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    note: row.note,
    items,
    totalCents: row.total_cents,
    total: formatPrice(row.total_cents / 100),
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

  const catalog = await readProducts();
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

  const result = getDb()
    .prepare(
      `INSERT INTO orders
         (created_at, updated_at, status, customer_name, customer_phone, note, items, total_cents)
       VALUES (?, ?, 'novo', ?, ?, ?, ?, ?)`
    )
    .run(now, now, customerName, customerPhone, note, JSON.stringify(items), totalCents);

  const order = getOrder(Number(result.lastInsertRowid));
  if (!order) throw new Error("Falha ao gravar o pedido");
  return order;
}

export function getOrder(id: number): Order | null {
  const row = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | OrderRow
    | undefined;
  return row ? toOrder(row) : null;
}

export function listOrders(limit = 500): Order[] {
  const rows = getDb()
    .prepare("SELECT * FROM orders ORDER BY id DESC LIMIT ?")
    .all(limit) as OrderRow[];
  return rows.map(toOrder);
}

export function updateOrderStatus(id: number, status: OrderStatus): Order | null {
  getDb()
    .prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, new Date().toISOString(), id);
  return getOrder(id);
}

export function deleteOrder(id: number): boolean {
  const result = getDb().prepare("DELETE FROM orders WHERE id = ?").run(id);
  return Number(result.changes) > 0;
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
