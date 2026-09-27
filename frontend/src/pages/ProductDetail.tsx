import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Minus, Plus, Star } from 'lucide-react'
import { fetchProduct, type Product, type ProductVariant } from '../lib/api'
import { effectivePrice, formatMoney, isOnSale } from '../lib/format'
import { useCart } from '../store/cart'

const primaryImage = (product: Product): string | null => {
  const images = product.product_images
  if (!images || images.length === 0) return null
  const primary = images.find((image) => image.is_primary)
  return (primary ?? images[0]).image_url
}

const allImages = (product: Product): string[] =>
  (product.product_images ?? [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((image) => image.image_url)

const inStock = (variant: ProductVariant | undefined): boolean =>
  variant !== undefined && variant.stock_quantity > 0

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [loaded, setLoaded] = useState<{ slug: string; product: Product } | null>(null)
  const [failure, setFailure] = useState<{ slug: string; message: string } | null>(null)
  const [variantId, setVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const add = useCart((state) => state.add)

  const key = slug ?? ''
  const loading = loaded?.slug !== key && failure?.slug !== key
  const error = failure?.slug === key ? failure.message : null
  const product = loaded?.slug === key ? loaded.product : null

  useEffect(() => {
    if (!slug) return
    let active = true

    fetchProduct(slug)
      .then((result) => {
        if (!active) return
        setLoaded({ slug, product: result })
        setActiveImage(primaryImage(result))
        const firstAvailable = (result.product_variants ?? []).find(inStock)
        setVariantId(firstAvailable?.id ?? null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setFailure({ slug, message: err instanceof Error ? err.message : 'Something went wrong' })
      })

    return () => {
      active = false
    }
  }, [slug])

  if (loading) return <p className="text-theme-text/60">Loading...</p>
  if (error) return <p className="rounded border border-theme-accent/40 p-4 text-sm">{error}</p>
  if (!product) return <p className="text-theme-text/60">Product not found.</p>

  const price = effectivePrice(product.price, product.sale_price)
  const onSale = isOnSale(product.price, product.sale_price)
  const variants = product.product_variants ?? []
  const selected = variants.find((v) => v.id === variantId)
  const gallery = allImages(product)
  const ceiling = selected ? selected.stock_quantity : 100
  const soldOut = variants.length > 0 && variants.every((v) => v.stock_quantity === 0)

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        variantId: variantId,
        name: product.name,
        slug: product.slug,
        imageUrl: activeImage ?? primaryImage(product),
        unitPrice: price,
        size: selected?.size ?? null,
        color: selected?.color ?? null,
        maxStock: selected ? selected.stock_quantity : null,
      },
      quantity,
    )
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="aspect-3/4 overflow-hidden rounded-lg bg-theme-secondary">
          {activeImage ? (
            <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-theme-text/40">
              No image
            </div>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-3">
            {gallery.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveImage(url)}
                className={`h-20 w-16 overflow-hidden rounded border ${
                  activeImage === url ? 'border-theme-accent' : 'border-theme-text/10'
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {product.category && (
          <Link
            to={`/shop?category=${product.category.slug}`}
            className="text-xs uppercase tracking-wide text-theme-text/60 hover:text-theme-accent"
          >
            {product.category.name}
          </Link>
        )}

        <h1 className="font-heading text-3xl">{product.name}</h1>

        {product.rating && product.rating.count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="flex text-theme-accent">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(product.rating!.average ?? 0) ? 'currentColor' : 'none'}
                />
              ))}
            </span>
            <span className="text-theme-text/60">
              {product.rating.average} ({product.rating.count})
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-3">
          <span className="font-heading text-2xl">{formatMoney(price)}</span>
          {onSale && (
            <span className="text-theme-text/50 line-through">{formatMoney(product.price)}</span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {product.fabric && (
            <>
              <dt className="text-theme-text/60">Fabric</dt>
              <dd>{product.fabric}</dd>
            </>
          )}
          {product.occasion && (
            <>
              <dt className="text-theme-text/60">Occasion</dt>
              <dd>{product.occasion}</dd>
            </>
          )}
          {product.sku && (
            <>
              <dt className="text-theme-text/60">SKU</dt>
              <dd>{product.sku}</dd>
            </>
          )}
        </dl>

        {product.description && (
          <p className="leading-relaxed text-theme-text/80">{product.description}</p>
        )}

        {variants.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-theme-text/60">
              Variation
              {selected?.size ? ` - size ${selected.size}` : ''}
              {selected?.color ? `, ${selected.color}` : ''}
            </span>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const disabled = variant.stock_quantity === 0
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setVariantId(variant.id)
                      setQuantity(1)
                    }}
                    className={`rounded border px-4 py-2 text-sm disabled:opacity-35 ${
                      variantId === variant.id
                        ? 'border-theme-accent text-theme-accent'
                        : 'border-theme-text/20'
                    }`}
                  >
                    {[variant.size, variant.color].filter(Boolean).join(' / ') || variant.id.slice(0, 6)}
                  </button>
                )
              })}
            </div>
            {selected && selected.stock_quantity > 0 && (
              <span className="text-xs text-theme-text/60">{selected.stock_quantity} in stock</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded border border-theme-text/20">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(ceiling, q + 1))}
              className="px-3 py-2"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || (variants.length > 0 && !selected)}
            className="flex-1 rounded bg-theme-primary px-6 py-3 uppercase tracking-wide text-theme-background disabled:opacity-40"
          >
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
