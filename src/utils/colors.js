export const COLOR_SWATCH = {
  زرد: '#E6B800',
  سفید: '#F7F3EC',
  مشکی: '#1C1916',
  سرمه‌ای: '#1B3A4B',
  خاکستری: '#8A847C',
  سبز: '#2F6F5E',
  آبی: '#3D5A80',
  نارنجی: '#C45C26',
  قرمز: '#B42318',
  طلایی: '#C4A484',
  شفاف: '#D9E2EC',
  قهوه‌ای: '#7C4A2D',
  بنفش: '#6D28D9',
}

export const COLOR_PRESETS = Object.keys(COLOR_SWATCH)

export function colorName(color) {
  if (!color) return ''
  if (typeof color === 'object') return String(color.name || '').trim()
  return String(color).trim()
}

export function colorHex(color) {
  if (!color) return '#94a3b8'
  if (typeof color === 'object') {
    if (color.hex) return color.hex
    return COLOR_SWATCH[color.name] || '#94a3b8'
  }
  const text = String(color).trim()
  if (text.startsWith('#')) return text
  return COLOR_SWATCH[text] || '#94a3b8'
}

export function normalizeColors(list) {
  if (!Array.isArray(list)) return []
  const seen = new Set()
  const out = []
  for (const item of list) {
    const name = colorName(item)
    if (!name || seen.has(name)) continue
    seen.add(name)
    const hex = colorHex(item)
    out.push({ name, hex })
  }
  return out
}
