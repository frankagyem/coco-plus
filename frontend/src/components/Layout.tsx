import { Link, NavLink, Outlet } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { THEMES, THEME_LABELS, useTheme } from '../store/theme'
import { useCartCount } from '../store/cart'

const navLink = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide uppercase transition-colors ${
    isActive ? 'text-theme-accent' : 'hover:text-theme-accent'
  }`

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
      <span className="hidden sm:inline text-theme-text/60">Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as typeof theme)}
        className="rounded border border-theme-text/20 bg-theme-background px-2 py-1 text-theme-text"
      >
        {THEMES.map((option) => (
          <option key={option} value={option}>
            {THEME_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Layout() {
  const count = useCartCount()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-theme-text/10 bg-theme-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
          <Link to="/" className="font-heading text-2xl font-semibold">
            COCO<span className="text-theme-accent">+</span>
          </Link>

          <nav className="flex flex-1 items-center gap-5">
            <NavLink to="/shop" className={navLink}>
              Shop
            </NavLink>
            <NavLink to="/shop?new=true" className={navLink}>
              New Arrivals
            </NavLink>
          </nav>

          <ThemeSwitcher />

          <Link
            to="/cart"
            className="relative flex items-center gap-2 text-sm uppercase tracking-wide hover:text-theme-accent"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-theme-accent px-1 text-xs text-theme-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-theme-text/10 py-8 text-center text-sm text-theme-text/60">
        <p>Premium fashion, meaningful products</p>
        <p className="mt-1">WhatsApp orders &middot; Dansoman, Accra</p>
      </footer>
    </div>
  )
}
