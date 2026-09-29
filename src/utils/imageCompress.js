/**
 * Compress a data-URL / blob URL image for product gallery storage.
 * Skips already-small JPEGs to keep save/upload fast.
 */
function approxBytes(dataUrl) {
  const comma = dataUrl.indexOf(',')
  if (comma < 0) return dataUrl.length
  return Math.floor((dataUrl.length - comma - 1) * 0.75)
}

function isAlreadyCompact(src, maxBytes) {
  if (!src.startsWith('data:image/jpeg') && !src.startsWith('data:image/webp')) return false
  return approxBytes(src) <= maxBytes
}

export function compressImage(src, options = {}) {
  const maxEdge = options.maxEdge || 1100
  const quality = options.quality ?? 0.72
  const mime = options.mime || 'image/jpeg'
  const maxBytes = options.maxBytes || 380_000
  const force = Boolean(options.force)

  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      resolve('')
      return
    }
    // Already remote/public path — leave as-is
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      resolve(src)
      return
    }
    // Already compressed enough — avoid second expensive encode on save
    if (!force && src.startsWith('data:') && isAlreadyCompact(src, maxBytes)) {
      resolve(src)
      return
    }

    const img = new Image()
    img.onload = () => {
      const longest = Math.max(img.width || 1, img.height || 1)
      const scale = Math.min(1, maxEdge / longest)
      // Tiny / already within edge and compact enough: skip redraw
      if (!force && scale >= 1 && src.startsWith('data:') && isAlreadyCompact(src, maxBytes)) {
        resolve(src)
        return
      }
      const width = Math.max(1, Math.round((img.width || 1) * scale))
      const height = Math.max(1, Math.round((img.height || 1) * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(src)
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      try {
        resolve(canvas.toDataURL(mime, quality))
      } catch {
        resolve(src)
      }
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

export async function compressGallery(list, options) {
  const items = Array.isArray(list) ? list : []
  return Promise.all(items.map((src) => compressImage(src, options)))
}
