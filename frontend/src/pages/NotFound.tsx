import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-heading text-3xl">Page not found</h1>
      <p className="text-theme-text/60">That page does not exist.</p>
      <Link
        to="/shop"
        className="rounded bg-theme-primary px-6 py-3 uppercase tracking-wide text-theme-background"
      >
        Browse the shop
      </Link>
    </div>
  )
}
