export function uniqueDocId(prefix) {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${time}-${rand}`
}

export function quoteIdForCart(items) {
  const key = 'imenmahdi-quote-id'
  const stamp = items.map((item) => `${item.id}:${item.size}:${item.quantity}`).join('|')
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (saved?.id && saved.stamp === stamp) return saved.id
    const id = uniqueDocId('QT')
    sessionStorage.setItem(key, JSON.stringify({ id, stamp }))
    return id
  } catch {
    return uniqueDocId('QT')
  }
}
