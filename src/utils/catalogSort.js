import { isPriceOnRequest } from '@/utils/money'

export const SORT_OPTIONS = [
  { id: 'popular', label: 'پرفروش' },
  { id: 'newest', label: 'جدیدترین' },
  { id: 'price-asc', label: 'ارزان‌تر' },
  { id: 'price-desc', label: 'گران‌تر' },
]

function newestStamp(item) {
  if (item?.createdAt) {
    const t = Date.parse(item.createdAt)
    if (!Number.isNaN(t)) return t
  }
  const match = String(item?.id || '').match(/^p-(\d+)$/)
  return match ? Number(match[1]) : 0
}

export function sortProducts(list, mode) {
  const copy = [...list]
  if (mode === 'newest') {
    copy.sort((a, b) => newestStamp(b) - newestStamp(a))
    return copy
  }
  if (mode === 'price-asc' || mode === 'price-desc') {
    const dir = mode === 'price-asc' ? 1 : -1
    copy.sort((a, b) => {
      const ar = isPriceOnRequest(a)
      const br = isPriceOnRequest(b)
      if (ar !== br) return ar ? 1 : -1
      return dir * ((Number(a.price) || 0) - (Number(b.price) || 0))
    })
    return copy
  }
  copy.sort((a, b) => Number(Boolean(b.hero || b.popular)) - Number(Boolean(a.hero || a.popular)))
  return copy
}

export function formatCount(value) {
  return new Intl.NumberFormat('fa-IR').format(Number(value) || 0)
}
