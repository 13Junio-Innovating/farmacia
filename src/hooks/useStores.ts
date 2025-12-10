import { useEffect, useState } from 'react'
import type { Store } from '@/types/orders'

const DEFAULT_STORES: Store[] = [
  { id: 'rv', name: 'Matriz - Rio Vermelho' },
  { id: 'ing', name: 'Filial - Ingleses' },
  { id: 'can', name: 'Filial - Canavieiras' },
]

export function useStores() {
  const [stores, setStores] = useState<Store[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('stores')
      if (raw) {
        const parsed = JSON.parse(raw) as Store[]
        setStores(parsed)
      } else {
        setStores(DEFAULT_STORES)
        localStorage.setItem('stores', JSON.stringify(DEFAULT_STORES))
      }
    } catch {
      setStores(DEFAULT_STORES)
    }
  }, [])

  function upsertStores(next: Store[]) {
    setStores(next)
    try {
      localStorage.setItem('stores', JSON.stringify(next))
    } catch {}
  }

  return { stores, upsertStores }
}
