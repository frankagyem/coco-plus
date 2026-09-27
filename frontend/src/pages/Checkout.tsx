import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createOrder, fetchDeliveryAreas, type DeliveryArea } from '../lib/api'
import { formatMoney } from '../lib/format'
import { useCart, useCartSubtotal } from '../store/cart'

interface Props {
  settings: { whatsapp: string | null; brand_name: string | null } | null
}

const normalisePhone = (raw: string): string => {
  const digits = raw.replace(/[^\d]/g, '')
  const local = digits.startsWith('0') ? digits.slice(1) : digits
  return `233${local}`
}

export function Checkout({ settings }: Props) {
  const { lines, clear } = useCart()
  const subtotal = useCartSubtotal()
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [areaId, setAreaId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [voucher, setVoucher] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDeliveryAreas()
      .then(setAreas)
      .catch(() => setAreas([]))
  }, [])

  const area = useMemo(() => areas.find((a) => a.id === areaId) ?? null, [areas, areaId])
  const deliveryFee = area ? (area.is_free ? 0 : Number(area.fee)) : 0
  const total = subtotal + deliveryFee

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Nothing to check out</h1>
        <Link
          to="/shop"
          className="rounded bg-theme-primary px-6 py-3 uppercase tracking-wide text-theme-background"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Name, phone and delivery address are all required.')
      return
    }
    if (!areaId) {
      setError('Choose a delivery area.')
      return
    }

    setSubmitting(true)
    try {
      const { data: order } = await createOrder({
        items: lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
        })),
        deliveryAreaId: areaId,
        deliveryAddress: `${address.trim()}, ${area?.name ?? ''}`,
        voucherCode: voucher.trim() || null,
        paymentMethod: 'WHATSAPP',
      })

      const linesText = lines
        .map((line) => {
          const variant = [line.size, line.color].filter(Boolean).join('/')
          return `- ${line.name}${variant ? ` (${variant})` : ''} x${line.quantity} = ${formatMoney(line.unitPrice * line.quantity)}`
        })
        .join('\n')

      const message = [
        `Hello ${settings?.brand_name ?? 'COCO+'}, I have placed order ${order.order_number}.`,
        '',
        linesText,
        '',
        `Subtotal: ${formatMoney(subtotal)}`,
        `Delivery (${area?.name}): ${formatMoney(deliveryFee)}`,
        `Total: ${formatMoney(total)}`,
        '',
        `Name: ${name.trim()}`,
        `Phone: ${phone.trim()}`,
        `Address: ${address.trim()}, ${area?.name ?? ''}`,
      ].join('\n')

      clear()

      const target = settings?.whatsapp
      if (target) {
        window.open(`https://wa.me/${normalisePhone(target)}?text=${encodeURIComponent(message)}`, '_blank')
      }

      toast.success(`Order ${order.order_number} created`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place the order')
    } finally {
      setSubmitting(false)
    }
  }

  const field =
    'w-full rounded border border-theme-text/20 bg-theme-background px-3 py-2 text-sm'

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl">Checkout</h1>

        {error && (
          <p className="rounded border border-theme-accent/40 bg-theme-accent/10 p-3 text-sm">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0XX XXX XXXX"
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Delivery area
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className={field}>
            <option value="">Choose an area</option>
            {areas.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - {option.is_free ? 'Free delivery' : formatMoney(option.fee)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Delivery address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Voucher code <span className="text-theme-text/50">(optional)</span>
          <input
            value={voucher}
            onChange={(e) => setVoucher(e.target.value.toUpperCase())}
            className={field}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-theme-primary px-6 py-3 uppercase tracking-wide text-theme-background disabled:opacity-50"
        >
          {submitting ? 'Placing order...' : 'Place order via WhatsApp'}
        </button>
      </form>

      <aside className="flex h-fit flex-col gap-4 rounded-lg bg-theme-secondary/40 p-6">
        <h2 className="font-heading text-xl">Order summary</h2>

        <ul className="flex flex-col gap-2 text-sm">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.variantId ?? 'default'}`} className="flex justify-between gap-4">
              <span>
                {line.name} x{line.quantity}
              </span>
              <span className="shrink-0">{formatMoney(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-theme-text/10 pt-3 text-sm">
          <span className="text-theme-text/60">Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-theme-text/60">Delivery</span>
          <span>{area ? formatMoney(deliveryFee) : 'Select an area'}</span>
        </div>

        <div className="flex justify-between border-t border-theme-text/10 pt-3">
          <span className="font-heading text-lg">Total</span>
          <span className="font-heading text-lg">{formatMoney(total)}</span>
        </div>

        <p className="text-xs text-theme-text/50">
          The order is recorded first, then you confirm it with us on WhatsApp. The total shown
          here is recalculated on the server.
        </p>
      </aside>
    </div>
  )
}
