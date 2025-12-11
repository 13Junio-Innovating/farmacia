import { STATUS_LABELS, type Order, type OrderStatus } from '@/types/orders'
import { User, Phone, MapPin, CalendarDays, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

type Props = {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
  onDelete: (id: string) => void
}

export function OrderCard({ order, onStatusChange, onDelete }: Props) {
  function formatBrPhone(p?: string) {
    const digits = (p || '').replace(/\D/g, '')
    if (!digits) return ''
    if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    return p || ''
  }
  const isUrgent = !!order.urgent || /urgente|prioridade/i.test(order.formula)
  function nextStatus(s: OrderStatus): OrderStatus | null {
    if (s === 'received') return 'in_production'
    if (s === 'in_production') return 'ready'
    if (s === 'ready') return 'shipped'
    return null
  }
  const advanceLabel = order.status === 'received' ? 'Avançar para Em Manipulação' : order.status === 'in_production' ? 'Avançar para Pronto' : order.status === 'ready' ? 'Avançar para Enviado' : 'Finalizado'
  function prevStatus(s: OrderStatus): OrderStatus | null {
    if (s === 'shipped') return 'ready'
    if (s === 'ready') return 'in_production'
    if (s === 'in_production') return 'received'
    return null
  }
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={`card p-3 border-2 ${isUrgent ? 'border-red-300' : ''} relative`}>
      <div className="min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="badge badge-blue">{STATUS_LABELS[order.status]}</span>
            {isUrgent ? <span className="badge badge-red">Urgente</span> : null}
          </div>
          <button className="text-gray-500" aria-label="Menu de ações" onClick={() => setMenuOpen((v) => !v)}>
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm text-gray-500 break-all sm:break-words">{order.formula}</div>
        {order.dosage || order.quantity ? (
          <div className="text-sm text-gray-700">{order.dosage || ''}{order.dosage && order.quantity ? ' • ' : ''}{order.quantity ? `${order.quantity}x` : ''}</div>
        ) : null}
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> {order.customer_name}</div>
          {order.phone ? (
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {formatBrPhone(order.phone)}</div>
          ) : null}
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {order.stores?.name}</div>
          {order.due_date ? (
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" /> {order.due_date}</div>
          ) : null}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 items-center">
        <button
          className={`btn ${nextStatus(order.status) ? 'btn-active' : ''} w-full`}
          disabled={!nextStatus(order.status)}
          onClick={() => {
            const ns = nextStatus(order.status)
            if (ns) onStatusChange(order.id, ns)
          }}
        >
          {advanceLabel}
        </button>
        <button className="btn btn-danger w-full" onClick={() => onDelete(order.id)}>
          Excluir
        </button>
      </div>

      {menuOpen ? (
        <div className="absolute right-3 top-10 z-10 bg-white border rounded-xl shadow p-2 w-56">
          <div className="grid gap-2">
            <button
              className={`btn ${nextStatus(order.status) ? 'btn-active' : ''}`}
              disabled={!nextStatus(order.status)}
              onClick={() => { const ns = nextStatus(order.status); if (ns) { onStatusChange(order.id, ns); setMenuOpen(false) } }}
            >
              Avançar
            </button>
            <button
              className="btn"
              disabled={!prevStatus(order.status)}
              onClick={() => { const ps = prevStatus(order.status); if (ps) { onStatusChange(order.id, ps); setMenuOpen(false) } }}
            >
              Retornar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
