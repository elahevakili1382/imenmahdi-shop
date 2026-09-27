const OUT_PATTERNS = /ناموجود|موجود\s*نیست|تمام\s*شد|ندارد|^0+$/i
const IN_PATTERNS = /موجود\s*است|موجوده|در\s*انبار/i

function toLatinDigits(value) {
  return String(value ?? '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
}

export function stockText(value) {
  return String(value ?? '').trim()
}

/** فقط وقتی کل مقدار عدد باشد */
export function stockQuantity(value) {
  const text = toLatinDigits(stockText(value))
  if (!text || !/^\d+$/.test(text)) return null
  return Number(text)
}

export function isOutOfStock(productOrStock) {
  const raw = productOrStock && typeof productOrStock === 'object' ? productOrStock.stock : productOrStock
  const text = stockText(raw)
  if (!text) return true
  const qty = stockQuantity(raw)
  if (qty !== null) return qty <= 0
  if (OUT_PATTERNS.test(text)) return true
  if (IN_PATTERNS.test(text)) return false
  return false
}

export function displayStock(productOrStock) {
  const raw = productOrStock && typeof productOrStock === 'object' ? productOrStock.stock : productOrStock
  const text = stockText(raw)
  if (!text) return 'ناموجود'
  const qty = stockQuantity(raw)
  if (qty !== null) return qty <= 0 ? 'ناموجود' : `موجودی: ${qty}`
  return text
}

export function maxOrderQty(productOrStock) {
  const raw = productOrStock && typeof productOrStock === 'object' ? productOrStock.stock : productOrStock
  if (isOutOfStock(raw)) return 0
  const qty = stockQuantity(raw)
  if (qty !== null && qty > 0) return qty
  return 99
}
