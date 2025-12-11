import { useMemo } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { useStores } from '@/hooks/useStores'
import type { OrderStatus } from '@/types/orders'
import { STATUS_LABELS } from '@/types/orders'
import * as XLSX from 'xlsx'

export default function Reports() {
  const { orders } = useOrders()
  const { stores } = useStores()

  const totals = useMemo(() => {
    const total = orders.length
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {} as Record<OrderStatus, number>)
    const done = (byStatus.ready || 0) + (byStatus.shipped || 0)
    const pending = total - done
    const donePct = total ? Math.round((done / total) * 100) : 0
    return { total, done, pending, byStatus, donePct }
  }, [orders])

  const byStore = useMemo(() => {
    const map = Object.fromEntries(stores.map((s) => [s.id, { name: s.name, count: 0 }])) as Record<string, { name: string; count: number }>
    for (const o of orders) {
      if (map[o.store_id]) map[o.store_id].count += 1
    }
    return map
  }, [orders, stores])

  const topFormulas = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const o of orders) {
      const key = o.formula.split('|')[0].trim()
      if (!key) continue
      freq[key] = (freq[key] || 0) + 1
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [orders])

  function exportExcel() {
    const sheetTotals = [
      { Total: totals.total, Finalizados: totals.done, Pendentes: totals.pending, PercentualFinalizados: `${totals.donePct}%` },
    ]
    const sheetStatus = [
      { Status: 'Recebido', Quantidade: totals.byStatus.received || 0 },
      { Status: 'Em Manipulação', Quantidade: totals.byStatus.in_production || 0 },
      { Status: 'Pronto', Quantidade: totals.byStatus.ready || 0 },
      { Status: 'Enviado', Quantidade: totals.byStatus.shipped || 0 },
    ]
    const sheetStores = stores.map((s) => ({ Loja: s.name, Quantidade: orders.filter((o) => o.store_id === s.id).length }))
    const sheetOrders = orders.map((o) => {
      const parts = (o.formula || '').split('|').map((p) => p.trim())
      const nomeFormula = parts[0] || ''
      const detalhesFormula = parts.slice(1).join(' | ')
      return {
        ID: o.id,
        Cliente: o.customer_name,
        'Fórmula (Nome)': nomeFormula,
        'Fórmula (Detalhes)': detalhesFormula,
        Dosagem: o.dosage ?? '',
        Quantidade: o.quantity ?? '',
        Status: STATUS_LABELS[o.status],
        Loja: o.stores?.name ?? '',
        Telefone: o.phone ?? '',
        'Data de Entrega': o.due_date ?? '',
        Observações: o.observations ?? '',
        Urgente: o.urgent ? 'Sim' : 'Não',
        'Fórmula Completa': o.formula ?? '',
      }
    })

    const wb = XLSX.utils.book_new()
    const wsTotals = XLSX.utils.json_to_sheet(sheetTotals)
    const wsStatus = XLSX.utils.json_to_sheet(sheetStatus)
    const wsStores = XLSX.utils.json_to_sheet(sheetStores)
    const wsOrders = XLSX.utils.json_to_sheet(sheetOrders)

    function formatSheet(ws: XLSX.WorkSheet, cols: number[]) {
      const ref = (ws as any)['!ref'] as string
      if (ref) {
        const r = XLSX.utils.decode_range(ref)
        const header = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: r.e.c } })
        ;(ws as any)['!autofilter'] = { ref: header }
        ;(ws as any)['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' }
        for (let c = 0; c <= r.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r: 0, c })
          const cell = (ws as any)[addr]
          if (cell) {
            cell.s = {
              fill: { fgColor: { theme: 1 } },
              font: { bold: true, color: { rgb: 'FFFFFF' } },
              alignment: { horizontal: 'center', vertical: 'center' },
            }
          }
        }
      }
      ;(ws as any)['!cols'] = cols.map((w) => ({ wch: w }))
    }

    formatSheet(wsTotals, [12, 12, 12, 22])
    formatSheet(wsStatus, [18, 12])
    formatSheet(wsStores, [28, 12])
    formatSheet(wsOrders, [16, 22, 32, 36, 12, 10, 16, 24, 18, 26, 10, 42])

    XLSX.utils.book_append_sheet(wb, wsTotals, 'Totais')
    XLSX.utils.book_append_sheet(wb, wsStatus, 'Por Status')
    XLSX.utils.book_append_sheet(wb, wsStores, 'Por Loja')
    XLSX.utils.book_append_sheet(wb, wsOrders, 'Pedidos')
    XLSX.writeFile(wb, 'relatorios_farmacia.xlsx')
  }

  return (
    <main className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Relatórios</h2>
          <p className="text-gray-500">Visão geral da produção e pedidos</p>
        </div>
        <button className="btn btn-active" onClick={exportExcel}>Exportar Excel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total de Pedidos</div>
          <div className="text-2xl font-semibold">{totals.total}</div>
          <div className="text-xs text-gray-500 mt-1">Todos os pedidos</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Finalizados</div>
          <div className="text-2xl font-semibold">{totals.done}</div>
          <div className="text-xs text-gray-500 mt-1">{totals.donePct}% do total</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Pendentes</div>
          <div className="text-2xl font-semibold">{totals.pending}</div>
          <div className="text-xs text-gray-500 mt-1">Aguardando processamento</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-medium mb-3">Pedidos por Loja</div>
          <div className="space-y-3">
            {stores.map((s) => (
              <div key={s.id} className="text-sm">
                {s.name} <span className="text-gray-500">{byStore[s.id]?.count || 0} pedidos</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="font-medium mb-3">Pedidos por Status</div>
          <div className="space-y-3">
            <div className="text-sm">Recebido <span className="text-gray-500">{totals.byStatus.received || 0} pedidos</span></div>
            <div className="text-sm">Em Manipulação <span className="text-gray-500">{totals.byStatus.in_production || 0} pedidos</span></div>
            <div className="text-sm">Pronto <span className="text-gray-500">{totals.byStatus.ready || 0} pedidos</span></div>
            <div className="text-sm">Enviado <span className="text-gray-500">{totals.byStatus.shipped || 0} pedidos</span></div>
          </div>
        </div>
      </div>
      <div className="card p-4">
        <div className="font-medium mb-3">Fórmulas Mais Pedidas</div>
        {topFormulas.length === 0 ? (
          <div className="text-sm text-gray-500">Sem dados</div>
        ) : (
          <ul className="space-y-2">
            {topFormulas.map(([name, count]) => (
              <li key={name} className="text-sm">{name} <span className="text-gray-500">{count} pedidos</span></li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
