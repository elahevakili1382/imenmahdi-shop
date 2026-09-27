import { isOutOfStock } from '@/utils/stock'
import { salePrice } from '@/utils/money'

const SITE_NAME = 'ایمن یاب'
const DEFAULT_TITLE = 'ایمن یاب | تجهیزات ایمنی و آتش‌نشانی'
const DEFAULT_DESCRIPTION =
  'فروشگاه تجهیزات ایمنی و آتش‌نشانی ایمن یاب. خرید کارت‌به‌کارت با تایید رسید توسط ادمین.'

function siteOrigin() {
  const env = import.meta.env.VITE_SITE_URL
  if (env) return String(env).replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export function absoluteUrl(pathOrHref = '/') {
  const origin = siteOrigin()
  if (/^https?:\/\//i.test(pathOrHref)) return pathOrHref
  const href = pathOrHref.startsWith('/') ? pathOrHref : `/${pathOrHref}`
  return origin ? `${origin}${href}` : href
}

function upsertMeta(attr, key, content) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!href) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function setJsonLd(id, data) {
  if (typeof document === 'undefined') return
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  const el = existing || document.createElement('script')
  el.type = 'application/ld+json'
  el.id = id
  el.textContent = JSON.stringify(data)
  if (!existing) document.head.appendChild(el)
}

/**
 * @param {{
 *   title?: string
 *   description?: string
 *   path?: string
 *   image?: string
 *   type?: string
 *   noIndex?: boolean
 * }} options
 */
export function applySeo(options = {}) {
  if (typeof document === 'undefined') return

  const title = options.title
    ? options.title.includes(SITE_NAME)
      ? options.title
      : `${options.title} | ${SITE_NAME}`
    : DEFAULT_TITLE
  const description = options.description || DEFAULT_DESCRIPTION
  const canonical = absoluteUrl(options.path || '/')
  const image = absoluteUrl(options.image || `${import.meta.env.BASE_URL}images/hero/factory-floor.jpg`)
  const type = options.type || 'website'

  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', options.noIndex ? 'noindex,nofollow' : 'index,follow')
  upsertLink('canonical', canonical)

  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:locale', 'fa_IR')
  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:image', image)

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', image)
}

export function productJsonLd(product, pageUrl) {
  if (!product) return null
  const image = product.image
    ? absoluteUrl(
        product.image.startsWith('http') || product.image.startsWith(import.meta.env.BASE_URL)
          ? product.image
          : `${import.meta.env.BASE_URL}${String(product.image).replace(/^\/+/, '')}`,
      )
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: image ? [image] : undefined,
    sku: product.id,
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand }
      : { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'IRR',
      price: String(salePrice(product) ?? 0),
      availability: !isOutOfStock(product)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION, SITE_NAME }
