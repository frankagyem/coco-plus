import { apiUrl } from './supabase'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server')
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(response.status, payload?.error ?? `Request failed (${response.status})`)
  }

  return payload as T
}

export interface Category {
  id: string
  name: string
  slug: string
  type: 'physical' | 'digital'
  image_url: string | null
  products?: { count: number }[] | null
}

export interface ProductImage {
  id?: string
  image_url: string
  is_primary?: boolean
  display_order?: number
}

export interface ProductVariant {
  id: string
  size: string | null
  color: string | null
  stock_quantity: number
}

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  sale_price: number | null
  fabric: string | null
  occasion: string | null
  status?: string
  is_featured?: boolean
  is_new_arrival?: boolean
  is_pre_order?: boolean
  description?: string | null
  sku?: string | null
  category_id?: string | null
  category?: { id: string; name: string; slug: string } | null
  product_images?: ProductImage[] | null
  product_variants?: ProductVariant[] | null
  rating?: { average: number | null; count: number }
}

export interface DeliveryArea {
  id: string
  name: string
  fee: number
  is_free: boolean
}

export interface StoreSettings {
  brand_name: string | null
  tagline: string | null
  whatsapp: string | null
  email: string | null
  location: string | null
  currency: string | null
  default_theme: string | null
}

export interface Order {
  id: string
  order_number: string | null
  total_amount: number
  discount_amount: number
  delivery_fee: number
  status: string
  payment_status: string
}

export const fetchCategories = () =>
  request<{ data: Category[] }>('/api/categories').then((r) => r.data)

export const fetchProducts = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return request<{ data: Product[]; total: number; page: number; limit: number }>(
    `/api/products${qs ? `?${qs}` : ''}`,
  )
}

export const fetchProduct = (slug: string) =>
  request<{ data: Product }>(`/api/products/${encodeURIComponent(slug)}`).then((r) => r.data)

export const createOrder = (body: {
  items: { productId: string; variantId?: string | null; quantity: number }[]
  deliveryAreaId?: string | null
  deliveryAddress?: string | null
  voucherCode?: string | null
  paymentMethod?: string
}) => request<{ data: Order }>('/api/orders', { method: 'POST', body: JSON.stringify(body) })

export const fetchDeliveryAreas = () =>
  request<{ data: DeliveryArea[] }>('/api/delivery-areas').then((r) => r.data)

export const fetchSettings = () =>
  request<{ data: StoreSettings | null }>('/api/settings').then((r) => r.data)
