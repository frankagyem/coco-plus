import { Link } from 'react-router-dom'
import type { Product } from '../lib/api'
import { effectivePrice, formatMoney, isOnSale } from '../lib/format'

const primaryImage = (product: Product): string | null => {
  const images = product.product_images
  if (!images || images.length === 0) return null
  const primary = images.find((image) => image.is_primary)
  return (primary ?? images[0]).image_url
}

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const image = primaryImage(product)
  const onSale = isOnSale(product.price, product.sale_price)
  const price = effectivePrice(product.price, product.sale_price)

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-theme-text/10 bg-theme-secondary/40 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-theme-secondary">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-theme-text/40">No image</div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {onSale && (
            <span className="rounded bg-theme-accent px-2 py-0.5 text-xs uppercase text-theme-background">
              Sale
            </span>
          )}
          {product.is_new_arrival && (
            <span className="rounded bg-theme-text px-2 py-0.5 text-xs uppercase text-theme-background">
              New
            </span>
          )}
          {product.is_pre_order && (
            <span className="rounded bg-theme-primary px-2 py-0.5 text-xs uppercase text-theme-background">
              Pre-order
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-theme-text/50">
            {product.category.name}
          </span>
        )}
        <h3 className="font-heading text-lg leading-tight">{product.name}</h3>
        {product.fabric && <span className="text-xs text-theme-text/60">{product.fabric}</span>}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold">{formatMoney(price)}</span>
          {onSale && (
            <span className="text-sm text-theme-text/50 line-through">
              {formatMoney(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
