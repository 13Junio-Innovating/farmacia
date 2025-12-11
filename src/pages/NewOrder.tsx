import { useState, useRef } from 'react'
import { useStores } from '@/hooks/useStores'
import { useOrders } from '@/hooks/useOrders'
import type { Order } from '@/types/orders'
import { Calendar } from 'lucide-react'

export default function NewOrder() {
  const { stores } = useStores()
  const { addOrder } = useOrders()

  const [storeId, setStoreId] = useState('')
  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [formula, setFormula] = useState('')
  const [dosage, setDosage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [dueDate, setDueDate] = useState('')
  const [dueDatePicker, setDueDatePicker] = useState('')
  const [observations, setObservations] = useState('')
  const [saved, setSaved] = useState(false)
  const [dateInvalid, setDateInvalid] = useState(false)
  const dateRef = useRef<HTMLInputElement>(null)

  function onSubmit() {
    const order: Order = {
      id: String(Date.now()),
      customer_name: customer,
      formula: (() => {
        let f = `${formula} | ${dosage} | ${quantity} un | entrega: ${dueDate}`
        if (observations.trim()) f += ` | obs: ${observations.trim()}`
        return f
      })(),
      status: 'received',
      store_id: storeId,
      stores: stores.find((s) => s.id === storeId),
      phone: phone,
      due_date: dueDate,
      dosage: dosage,
      quantity: parseInt(quantity || '0', 10) || 0,
      observations: observations.trim() || undefined,
      urgent: /urgente|prioridade/i.test(observations),
    }
    addOrder(order)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function formatIsoToBr(iso: string) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  function maskDate(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const dd = digits.slice(0, 2)
    const mm = digits.slice(2, 4)
    const yyyy = digits.slice(4, 8)
    let out = dd
    if (mm) out += '/' + mm
    if (yyyy) out += '/' + yyyy
    return out
  }

  function maskPhoneBr(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    const d1 = digits.slice(0, 2)
    const rest = digits.slice(2)
    let out = ''
    if (d1) out = `(${d1}`
    if (d1 && rest.length >= 0) out += ') '
    if (rest.length <= 4) {
      out += rest
    } else if (rest.length <= 8) {
      out += `${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`
    } else {
      out += `${rest.slice(0, 5)}-${rest.slice(5, 9)}`
      if (rest.length > 9) out = `(${d1}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}${rest.slice(9)}`
    }
    // For 10 vs 11 digits: (DD) DDDDD-DDDD for 11; (DD) DDDD-DDDD for 10
    if (digits.length === 10) out = `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6,10)}`
    if (digits.length === 11) out = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
    return out
  }

  function isValidBrDate(br: string) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(br)) return false
    const [d, m, y] = br.split('/').map((v) => parseInt(v, 10))
    const dt = new Date(y, m - 1, d)
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  }

  function parseBrToIso(br: string) {
    if (!isValidBrDate(br)) return ''
    const [d, m, y] = br.split('/')
    return `${y}-${m}-${d}`
  }

  return (
    <main className="container py-8">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          <img src="/logo.jpg" alt="Logo" className="h-12 w-12 object-cover" />
        </div>
        <h2 className="text-2xl font-semibold">Novo Pedido</h2>
        <p className="text-gray-500">Preencha os dados do pedido para enviar à matriz</p>
      </div>
      <div className="card p-6 max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <label className="text-sm">Loja de Origem</label>
          <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">Selecione a loja</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Nome do Cliente</label>
            <input className="input" placeholder="João Silva" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Telefone / WhatsApp</label>
            <input className="input" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(maskPhoneBr(e.target.value))} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Fórmula</label>
          <textarea className="input min-h-[120px]" placeholder="Descreva a fórmula completa..." value={formula} onChange={(e) => setFormula(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Dosagem</label>
            <input className="input" placeholder="100mg" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Quantidade</label>
            <input className="input" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Prazo de Entrega</label>
            <div className="relative">
              <input
                className="input pr-10"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={dueDate}
                onChange={(e) => {
                  const masked = maskDate(e.target.value)
                  setDueDate(masked)
                  const valid = isValidBrDate(masked)
                  setDateInvalid(!valid)
                  const iso = parseBrToIso(masked)
                  setDueDatePicker(iso)
                }}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => dateRef.current?.showPicker?.()}
                aria-label="Abrir calendário"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <input
                ref={dateRef}
                type="date"
                className="sr-only"
                value={dueDatePicker}
                onChange={(e) => {
                  const iso = e.target.value
                  setDueDatePicker(iso)
                  const br = formatIsoToBr(iso)
                  setDueDate(br)
                  setDateInvalid(!isValidBrDate(br))
                }}
              />
            </div>
            {dueDate && dateInvalid && <div className="text-xs text-red-600">Data inválida</div>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Observações (opcional)</label>
          <textarea
            className="input min-h-[100px]"
            placeholder="Instruções especiais, alergias, etc..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>
        <div className="flex justify-end items-center gap-3">
          {saved && <span className="badge badge-green">Pedido salvo</span>}
          <button className="btn btn-active" onClick={onSubmit}>Enviar Pedido</button>
        </div>
      </div>
    </main>
  )
}
