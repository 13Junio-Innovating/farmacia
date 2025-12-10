import { STATUS_LABELS, type Order, type OrderStatus } from '@/types/orders'

type Props = {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
  onDelete: (id: string) => void
}

export function OrderCard({ order, onStatusChange, onDelete }: Props) {
  return (
    <div className="card p-3">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{order.customer_name}</div>
          <div className="text-sm text-gray-500">{order.formula}</div>
          <div className="text-xs text-gray-500">{order.stores?.name}</div>
        </div>
        <button className="text-red-600 text-sm" onClick={() => onDelete(order.id)}>
          Excluir
        </button>
      </div>
      <div className="mt-3 flex gap-2 items-center">
        <label className="text-sm">Status:</label>
        <select
          className="border rounded-xl px-2 py-1 text-sm"
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
        >
          {Object.keys(STATUS_LABELS).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s as OrderStatus]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
