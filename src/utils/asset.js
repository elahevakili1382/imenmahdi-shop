export function asset(path = '') {
  const value = String(path)
  if (!value) return ''
  if (value.startsWith('data:') || value.startsWith('blob:') || /^https?:\/\//.test(value)) {
    return value
  }
  // فایل‌های آپلودشده روی ریشه API هستند، نه زیر base فرانت
  if (value.startsWith('/uploads/') || value.startsWith('uploads/')) {
    return value.startsWith('/') ? value : `/${value}`
  }
  const clean = value.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
