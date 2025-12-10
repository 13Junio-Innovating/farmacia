export type OrderStatus = 'received' | 'in_production' | 'ready' | 'shipped'

export const STATUS_ORDER: OrderStatus[] = [
  'received',
  'in_production',
  'ready',
  'shipped',
]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recebido',
  in_production: 'Em Manipulação',
  ready: 'Pronto',
  shipped: 'Enviado',
}

export interface Store {
  id: string
  name: string
}

export interface Order {
  id: string
  customer_name: string
  formula: string
  status: OrderStatus
  store_id: string
  stores?: Store
}
