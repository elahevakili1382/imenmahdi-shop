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

export function formatGroupedPrice(value) {
  const n = toNumber(value)
  if (!n) return ''
  return n.toLocaleString('en-US')
}

export function isPriceOnRequest(product) {
  return Boolean(product?.priceOnRequest)
}

/** درصد تخفیف ۰ تا ۱۰۰ */
export function discountPercent(product) {
  if (isPriceOnRequest(product)) return 0
  const n = toNumber(product?.discountPercent)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(100, Math.round(n))
}

export function hasDiscount(product) {
  return discountPercent(product) > 0 && toNumber(product?.price) > 0
}

/** قیمت نهایی بعد از تخفیف */
export function salePrice(product) {
  const price = toNumber(product?.price)
  const percent = discountPercent(product)
  if (!percent) return price
  return Math.max(0, Math.round((price * (100 - percent)) / 100))
}

export function displayPrice(product) {
  if (isPriceOnRequest(product)) return 'جهت خرید تماس بگیرید'
  return `${formatPrice(salePrice(product))} تومان`
}

export function formatCardNumber(value) {
  return String(value)
    .replace(/\s/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1-')
}
