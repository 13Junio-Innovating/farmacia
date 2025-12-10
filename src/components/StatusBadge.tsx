import type { OrderStatus } from '@/types/orders'

const LABEL: Record<OrderStatus, string> = {
  received: 'Recebido',
  in_production: 'Em Manipulação',
  ready: 'Pronto',
  shipped: 'Enviado',
}

const COLORS: Record<OrderStatus, string> = {
  received: 'badge-blue',
  in_production: 'badge-yellow',
  ready: 'badge-green',
  shipped: 'badge-purple',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${COLORS[status]}`}>{LABEL[status]}</span>
}
