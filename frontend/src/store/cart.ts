import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { effectivePrice } from '../lib/format'

export interface CartLine {
  productId: string
  variantId: string | null
  name: string
  slug: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  size: string | null
  color: string | null
  maxStock: number | null
}

interface CartState {
  lines: CartLine[]
  add: (line: Omit<CartLine, 'quantity'>, quantity: number) => void
  remove: (productId: string, variantId: string | null) => void
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clear: () => void
}

const sameLine = (line: CartLine, productId: string, variantId: string | null) =>
  line.productId === productId && line.variantId === variantId

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (line, quantity) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line.productId, line.variantId))
          const ceiling = line.maxStock ?? 100

          if (existing) {
            const next = Math.min(existing.quantity + quantity, ceiling)
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.productId, line.variantId) ? { ...l, quantity: next } : l,
              ),
            }
          }

          return { lines: [...state.lines, { ...line, quantity: Math.min(quantity, ceiling) }] }
        }),

      remove: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, productId, variantId)),
        })),

      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (sameLine(l, productId, variantId) ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),

      clear: () => set({ lines: [] }),
    }),
    { name: 'coco-plus-cart' },
  ),
)

export const useCartCount = (): number =>
  useCart((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0))

export const useCartSubtotal = (): number =>
  useCart((state) =>
    state.lines.reduce((sum, line) => sum + effectivePrice(line.unitPrice, null) * line.quantity, 0),
  )
