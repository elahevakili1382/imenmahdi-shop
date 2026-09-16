/** Short numeric invoice/order id, e.g. 48291736 */
export function numericDocId(digits = 8) {
  const size = Math.max(4, Math.min(12, Number(digits) || 8))
  const min = 10 ** (size - 1)
  const max = 10 ** size - 1
  return String(Math.floor(min + Math.random() * (max - min + 1)))
}

export function uniqueOrderId(existingIds = []) {
  const taken = new Set(existingIds.map(String))
  let id = numericDocId(8)
  let guard = 0
  while (taken.has(id) && guard < 40) {
    id = numericDocId(8)
    guard += 1
  }
  return id
}

/** @deprecated Prefer uniqueOrderId for orders; kept for non-order docs. */
export function uniqueDocId(prefix) {
  if (!prefix) return numericDocId(8)
  return `${prefix}-${numericDocId(6)}`
}

export function quoteIdForCart(items) {
  const key = 'imenmahdi-quote-id'
  const stamp = items.map((item) => `${item.id}:${item.size}:${item.quantity}`).join('|')
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (saved?.id && saved.stamp === stamp) return saved.id
    const id = numericDocId(8)
    sessionStorage.setItem(key, JSON.stringify({ id, stamp }))
    return id
  } catch {
    return numericDocId(8)
  }
}
