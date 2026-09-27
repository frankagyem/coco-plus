import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { useCart, useCartSubtotal } from '../store/cart'

export function Cart() {
  const { lines, setQuantity, remove, clear } = useCart()
  const subtotal = useCartSubtotal()

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Your cart is empty</h1>
        <p className="text-theme-text/60">Nothing here yet.</p>
        <Link
          to="/shop"
          className="rounded bg-theme-primary px-6 py-3 uppercase tracking-wide text-theme-background"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl">Your cart</h1>

      <ul className="flex flex-col divide-y divide-theme-text/10">
        {lines.map((line) => (
          <li key={`${line.productId}-${line.variantId ?? 'default'}`} className="flex gap-4 py-4">
            <div className="h-28 w-20 shrink-0 overflow-hidden rounded bg-theme-secondary">
              {line.imageUrl && (
                <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Link to={`/product/${line.slug}`} className="font-heading text-lg hover:underline">
                {line.name}
              </Link>
              {(line.size || line.color) && (
                <span className="text-xs text-theme-text/60">
                  {[line.size, line.color].filter(Boolean).join(' / ')}
                </span>
              )}

              <div className="mt-auto flex items-center gap-4">
                <div className="flex items-center rounded border border-theme-text/20">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                    className="px-3 py-1"
                    aria-label="Decrease"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                    className="px-3 py-1"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>

                <span className="text-sm">{formatMoney(line.unitPrice * line.quantity)}</span>

                <button
                  type="button"
                  onClick={() => remove(line.productId, line.variantId)}
                  className="ml-auto text-theme-text/50 hover:text-theme-accent"
                  aria-label={`Remove ${line.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-end gap-4 border-t border-theme-text/10 pt-6">
        <div className="flex items-center gap-6">
          <span className="text-theme-text/60">Subtotal</span>
          <span className="font-heading text-2xl">{formatMoney(subtotal)}</span>
        </div>
        <p className="text-xs text-theme-text/50">Delivery is calculated at checkout.</p>

        <div className="flex gap-3">
          <button type="button" onClick={clear} className="px-4 text-sm text-theme-text/60 hover:text-theme-accent">
            Clear cart
          </button>
          <Link
            to="/checkout"
            className="rounded bg-theme-primary px-8 py-3 uppercase tracking-wide text-theme-background"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
