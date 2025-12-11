import { useEffect, useState } from 'react'
import type { Order, OrderStatus, Store } from '@/types/orders'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const isLoading = false

  useEffect(() => {
    try {
      const raw = localStorage.getItem('orders')
      if (raw) {
        setOrders(JSON.parse(raw))
      } else {
        setOrders([])
        localStorage.setItem('orders', JSON.stringify([]))
      }
    } catch {
      setOrders([])
    }
  }, [])

  useEffect(() => {
    try {
      const mark = localStorage.getItem('orders_seeded')
      if (mark) return
      const count = orders.length
      if (count >= 20) {
        localStorage.setItem('orders_seeded', '1')
        return
      }
      const storesRaw = localStorage.getItem('stores')
      const stores: Store[] = storesRaw ? JSON.parse(storesRaw) : []
      const statuses: OrderStatus[] = ['received', 'in_production', 'ready', 'shipped']
      function brDateFromNow(days: number) {
        const d = new Date()
        d.setDate(d.getDate() + days)
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yy = d.getFullYear()
        return `${dd}/${mm}/${yy}`
      }
      const names = ['João Silva', 'Maria Souza', 'Carlos Pereira', 'Ana Lima', 'Paulo Santos', 'Luiza Costa', 'Marcos Alves', 'Beatriz Rocha', 'Felipe Araujo', 'Camila Nunes', 'Rafael Ribeiro', 'Patrícia Melo', 'Gustavo Fernandes', 'Juliana Freitas', 'Bruno Oliveira', 'Larissa Gomes', 'Rodrigo Teixeira', 'Aline Barros', 'Thiago Carvalho', 'Fernanda Duarte']
      const formulas = ['Dipirona 1g', 'Ibuprofeno 600mg', 'Omeprazol 20mg', 'Vitamina D 2000UI', 'Complexo B', 'Colágeno 2g', 'Magnésio 300mg', 'Cafeína 210mg', 'Zinco 50mg', 'Cálcio 500mg', 'Paracetamol 750mg', 'Melatonina 3mg', 'Vitamina C 1g', 'Biotina 10mg', 'Ác. Fólico 5mg', 'Sulfato Ferroso 120mg', 'Probioticos 10bi UFC', 'N-Acetilcisteína 600mg', 'Ômega 3 1000mg', 'Coenzima Q10 100mg']
      const dosages = ['100mg', '250mg', '500mg', '1g']
      const phones = ['(48) 99999-1111', '(48) 98888-2222', '(48) 97777-3333', '(48) 96666-4444', '(48) 95555-5555', '(48) 94444-6666', '(48) 93333-7777', '(48) 92222-8888', '(48) 91111-9999', '(11) 99999-0000']
      const next: Order[] = [...orders]
      for (let i = 0; i < 20 - count; i++) {
        const idx = i % names.length
        const st = statuses[i % statuses.length]
        const store = stores[(i + 1) % (stores.length || 1)] || { id: 'rv', name: 'Matriz - Rio Vermelho' }
        const qty = (i % 5) + 1
        const due = brDateFromNow((i % 15) + 1)
        const obs = i % 7 === 0 ? 'urgente' : i % 6 === 0 ? 'prioridade' : ''
        const phone = phones[i % phones.length]
        const dosage = dosages[i % dosages.length]
        const formula = `${formulas[i % formulas.length]} | ${dosage} | ${qty} un | entrega: ${due}${obs ? ` | obs: ${obs}` : ''}`
        next.push({
          id: String(Date.now()) + '-' + i,
          customer_name: names[idx],
          formula,
          status: st,
          store_id: store.id,
          stores: store,
          phone,
          due_date: due,
          dosage,
          quantity: qty,
          observations: obs || undefined,
          urgent: /urgente|prioridade/i.test(obs),
        })
      }
      persist(next)
      localStorage.setItem('orders_seeded', '1')
    } catch {}
  }, [orders])

  function persist(next: Order[]) {
    setOrders(next)
    try {
      localStorage.setItem('orders', JSON.stringify(next))
    } catch {}
  }

  function updateOrderStatus(id: string, status: OrderStatus) {
    persist(orders.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  function deleteOrder(id: string) {
    persist(orders.filter((o) => o.id !== id))
  }

  function addOrder(order: Order) {
    persist([...orders, order])
  }

  return { orders, isLoading, updateOrderStatus, deleteOrder, addOrder }
}
