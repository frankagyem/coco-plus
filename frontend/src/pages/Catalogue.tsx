import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchCategories, fetchProducts, type Category, type Product } from '../lib/api'
import { ProductCard } from '../components/ProductCard'

const PAGE_SIZE = 24

export function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState<{ key: string; data: Product[]; total: number } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const category = searchParams.get('category') ?? ''
  const isNew = searchParams.get('new') === 'true'
  const search = searchParams.get('search') ?? ''
  const [page, setPage] = useState(1)

  const queryKey = `${category}|${isNew}|${search}|${page}`
  const loading = result?.key !== queryKey && failure?.key !== queryKey
  const error = failure?.key === queryKey ? failure.message : null

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let active = true
    const key = `${category}|${isNew}|${search}|${page}`

    fetchProducts({
      category: category || undefined,
      new: isNew ? 'true' : undefined,
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((response) => {
        if (!active) return
        setResult({ key, data: response.data, total: response.total })
      })
      .catch((err: unknown) => {
        if (!active) return
        setFailure({
          key,
          message: err instanceof Error ? err.message : 'Something went wrong',
        })
      })

    return () => {
      active = false
    }
  }, [category, isNew, search, page])

  const products = result?.key === queryKey ? result.data : []
  const total = result?.key === queryKey ? result.total : 0

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setPage(1)
    setSearchParams(next)
  }

  const pages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">
          {isNew ? 'New arrivals' : search ? `Results for "${search}"` : 'All products'}
        </h1>

        <input
          type="search"
          value={search}
          onChange={(event) => setFilter('search', event.target.value || null)}
          placeholder="Search"
          className="rounded border border-theme-text/20 bg-theme-background px-3 py-2 text-sm"
        />
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('category', null)}
          className={`rounded-full border px-4 py-1.5 text-sm ${
            category === '' ? 'border-theme-accent text-theme-accent' : 'border-theme-text/20'
          }`}
        >
          All
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter('category', item.slug)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              category === item.slug
                ? 'border-theme-accent text-theme-accent'
                : 'border-theme-text/20'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded border border-theme-accent/40 bg-theme-accent/10 p-4 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-theme-text/60">Loading...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-theme-text/60">No products match those filters.</p>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-theme-text/20 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-theme-text/60">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page === pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="rounded border border-theme-text/20 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
