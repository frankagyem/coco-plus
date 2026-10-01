import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchProducts, type Category, type Product } from '../lib/api'
import { ProductCard } from '../components/ProductCard'
import { BathroomBeddingPromo } from '../components/BathroomBeddingPromo'

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [products, cats] = await Promise.all([
          fetchProducts({ featured: 'true', limit: 8 }),
          fetchCategories(),
        ])
        if (active) {
          setFeatured(products.data)
          setCategories(cats)
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-16">
      <section className="rounded-lg bg-theme-secondary/50 px-6 py-20 text-center">
        <h1 className="font-heading text-4xl md:text-5xl">Premium fashion, meaningful products</h1>
        <p className="mx-auto mt-4 max-w-xl text-theme-text/70">
          Considered pieces in fabrics worth keeping, made to last past the season.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded bg-theme-primary px-8 py-3 uppercase tracking-wide text-theme-background transition-opacity hover:opacity-90"
        >
          Shop the collection
        </Link>
      </section>

      <BathroomBeddingPromo />

      {error && (
        <p className="rounded border border-theme-accent/40 bg-theme-accent/10 p-4 text-sm">
          {error}
        </p>
      )}

      {categories.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl">Shop by category</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="rounded-full border border-theme-text/20 px-5 py-2 text-sm hover:border-theme-accent hover:text-theme-accent"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-2xl">Featured</h2>
          <Link to="/shop" className="text-sm text-theme-accent hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="mt-4 text-theme-text/60">Loading...</p>
        ) : featured.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-theme-text/60">Nothing featured yet.</p>
        )}
      </section>
    </div>
  )
}
