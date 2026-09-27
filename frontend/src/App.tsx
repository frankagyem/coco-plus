import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { fetchSettings } from './lib/api'
import { Home } from './pages/Home'
import { Catalogue } from './pages/Catalogue'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { NotFound } from './pages/NotFound'

interface StoreSettings {
  whatsapp: string | null
  brand_name: string | null
}

function App() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
  }, [])

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Catalogue />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout settings={settings} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <Toaster position="bottom-right" />
    </>
  )
}

export default App
