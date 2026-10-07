// Tipos e constantes de pedidos — sem dependências de servidor (pode ser usado no navegador).

export const ORDER_STATUSES = [
  "novo",
  "em_atendimento",
  "pago",
  "entregue",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  pago: "Pago",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export type OrderItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  unitCents: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  note: string;
  items: OrderItem[];
  totalCents: number;
  total: string;
};
