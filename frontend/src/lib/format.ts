const formatters = new Map<string, Intl.NumberFormat>()

export const formatMoney = (amount: number, currency = 'GHS'): string => {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    })
    formatters.set(currency, formatter)
  }
  return formatter.format(Number.isFinite(amount) ? amount : 0)
}

export const effectivePrice = (price: number, salePrice: number | null): number =>
  salePrice !== null ? salePrice : price

export const isOnSale = (price: number, salePrice: number | null): boolean =>
  salePrice !== null && salePrice < price
