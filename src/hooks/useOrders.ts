import { useEffect, useState } from 'react'
import type { Order, OrderStatus } from '@/types/orders'

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
