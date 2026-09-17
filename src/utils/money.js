export function toNumber(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  const normalized = String(value)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[^\d]/g, '')
  return Number(normalized) || 0
}

export function formatPrice(value) {
  return new Intl.NumberFormat('fa-IR').format(toNumber(value))
}

export function isPriceOnRequest(product) {
  return Boolean(product?.priceOnRequest)
}

export function displayPrice(product) {
  if (isPriceOnRequest(product)) return 'جهت خرید تماس بگیرید'
  return `${formatPrice(product.price)} تومان`
}

export function formatCardNumber(value) {
  return String(value)
    .replace(/\s/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1-')
}
