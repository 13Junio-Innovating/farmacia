import { useState, useMemo } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { useStores } from '@/hooks/useStores'
import { OrderCard } from '@/components/OrderCard'
import { StatsCard } from '@/components/StatsCard'
import { StatusBadge } from '@/components/StatusBadge'
import { OrderStatus, STATUS_ORDER, STATUS_LABELS } from '@/types/orders'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Beaker, CheckCircle2, Truck, Search, Filter } from 'lucide-react'

export default function Dashboard() {
  const { orders, isLoading, updateOrderStatus, deleteOrder } = useOrders()
  const { stores } = useStores()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [storeFilter, setStoreFilter] = useState<string>('all')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.stores?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesStore = storeFilter === 'all' || order.store_id === storeFilter

      return matchesSearch && matchesStatus && matchesStore
    })
  }, [orders, searchTerm, statusFilter, storeFilter])

  const stats = useMemo(() => {
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<OrderStatus, number>)

    return {
      received: byStatus.received || 0,
      in_production: byStatus.in_production || 0,
      ready: byStatus.ready || 0,
      shipped: byStatus.shipped || 0,
      total: orders.length,
    }
  }, [orders])

  const storeSummary = useMemo(() => {
    return stores.map((s) => {
      const list = orders.filter((o) => o.store_id === s.id)
      const total = list.length
      const done = list.filter((o) => o.status === 'ready' || o.status === 'shipped').length
      const pct = total ? Math.round((done / total) * 100) : 0
      return { id: s.id, name: s.name, total, done, pct }
    })
  }, [orders, stores])

  const ordersByStatus = useMemo(() => {
    return STATUS_ORDER.reduce((acc, status) => {
      acc[status] = filteredOrders.filter((o) => o.status === status)
      return acc
    }, {} as Record<OrderStatus, typeof filteredOrders>)
  }, [filteredOrders])

  return (
    <main className="container py-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {storeSummary.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-gray-500">{s.total} pedidos • {s.done} finalizados</div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </section>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Recebidos" value={stats.received} subtitle="Aguardando produção" icon={Package} />
        <StatsCard title="Em Manipulação" value={stats.in_production} subtitle="Na produção" icon={Beaker} />
        <StatsCard title="Prontos" value={stats.ready} subtitle="Para envio" icon={CheckCircle2} />
        <StatsCard title="Enviados" value={stats.shipped} subtitle="Hoje" icon={Truck} />
      </section>

      <section className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="input pl-9" placeholder="Buscar por cliente, fórmula ou loja..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="btn">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
        <select className="btn" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}>
          <option value="all">Todos os status</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select className="btn" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
          <option value="all">Todas as lojas</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="text-gray-500 text-sm">({ordersByStatus[status].length})</span>
                </h2>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {ordersByStatus[status].length === 0 ? (
                  <div className="grid gap-3">
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-xl text-gray-500 text-sm">
                      Nenhum pedido
                    </div>
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-xl text-gray-500 text-sm">
                      Nenhum pedido
                    </div>
                  </div>
                ) : (
                  ordersByStatus[status].map((order) => (
                    <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} onDelete={deleteOrder} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
