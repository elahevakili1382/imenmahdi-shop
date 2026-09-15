export function asset(path = '') {
  const value = String(path)
  if (!value) return ''
  if (value.startsWith('data:') || value.startsWith('blob:') || /^https?:\/\//.test(value)) {
    return value
  }
  const clean = value.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
