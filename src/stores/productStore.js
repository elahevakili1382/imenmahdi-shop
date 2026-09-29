import { defineStore } from 'pinia'
import { products as catalog, categoryTree } from '@/data/catalog'
import { brands as seedBrands } from '@/data/brands'
import { slugify } from '@/utils/slugify'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { stockQuantity } from '@/utils/stock'

const STORAGE_KEY = 'imenmahdi-products'
const CAT_KEY = 'imenmahdi-custom-categories'
const BRAND_KEY = 'imenmahdi-custom-brands'
const REMOVED_KEY = 'imenmahdi-removed-products'
const HIDDEN_CAT_KEY = 'imenmahdi-hidden-categories'
const HIDDEN_SUB_KEY = 'imenmahdi-hidden-subcategories'
const CATALOG_EPOCH_KEY = 'imenmahdi-catalog-epoch'
/** Bump to force-drop bad local extras (screenshot / wrong-category imports). */
const CATALOG_EPOCH = '3'

const BROKEN_CATALOG_NEW_PREFIXES = [
  'p-patan',
  'p-safety-slipon',
  'p-aghanezhad',
  'p-farzin',
  'p-bump-cap',
  'p-polo',
]

function isBrokenCatalogNewProduct(product) {
  const id = String(product?.id || '')
  if (BROKEN_CATALOG_NEW_PREFIXES.some((prefix) => id.startsWith(prefix))) return true
  const blob = JSON.stringify(product || {})
  return blob.includes('images/catalog-new/') || blob.includes('catalog-new')
}

function isClientOnlyProduct(item) {
  if (!item?.id) return false
  if (item.pendingSync === true) return true
  return /^p-\d+$/.test(String(item.id))
}

function collectLocalExtras(candidates, removed, serverIds) {
  const byId = new Map()
  for (const item of candidates || []) {
    if (!item?.id || isBrokenCatalogNewProduct(item)) continue
    const id = String(item.id)
    if (removed.has(id) || serverIds.has(id)) continue
    if (!isClientOnlyProduct(item)) continue
    byId.set(id, item)
  }
  return [...byId.values()]
}

function lightweightForStorage(products) {
  return (products || []).map((item) => {
    const gallery = (Array.isArray(item.gallery) ? item.gallery : []).filter(
      (src) => src && !String(src).startsWith('data:'),
    )
    const image = item.image && !String(item.image).startsWith('data:') ? item.image : gallery[0] || ''
    return {
      ...item,
      image,
      gallery: gallery.length ? gallery : image ? [image] : [],
    }
  })
}

function purgeBrokenStorageOnce() {
  try {
    if (localStorage.getItem(CATALOG_EPOCH_KEY) === CATALOG_EPOCH) return
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(saved) && saved.length) {
      const cleaned = saved.filter((item) => !isBrokenCatalogNewProduct(item))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    }
    localStorage.setItem(CATALOG_EPOCH_KEY, CATALOG_EPOCH)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(CATALOG_EPOCH_KEY, CATALOG_EPOCH)
  }
}

purgeBrokenStorageOnce()

function asCategoryGroup(name, children = [], icon = 'fa-solid fa-box') {
  const kids = (children || []).filter(Boolean).map((child) => {
    if (typeof child === 'string') return { name: child, slug: slugify(child) }
    return { name: child.name, slug: child.slug || slugify(child.name) }
  })
  return { name, icon, slug: slugify(name), children: kids }
}

function readRemovedIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]')
    if (Array.isArray(saved)) return [...new Set(saved.map(String).filter(Boolean))]
  } catch {
    /* keep empty */
  }
  return []
}

function readSavedProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(saved)) return saved.filter((item) => !isBrokenCatalogNewProduct(item))
  } catch {
    /* keep empty */
  }
  return null
}

function overlayProduct(base, incoming) {
  if (!incoming) return base
  const media = base ? pickMedia(base, incoming) : { image: incoming.image, gallery: incoming.gallery }
  return withSlugs({
    ...base,
    ...incoming,
    image: media.image,
    gallery: media.gallery,
    colors: incoming.colors?.length ? incoming.colors : base?.colors,
    features: Array.isArray(incoming.features) ? incoming.features : base?.features,
    specs: Array.isArray(incoming.specs) ? incoming.specs : base?.specs,
  })
}

function assembleProducts(serverList = []) {
  const removed = new Set(readRemovedIds())
  const local = readSavedProducts()
  const server = Array.isArray(serverList) ? serverList : []
  const byId = new Map()

  for (const item of catalog) {
    if (removed.has(item.id)) continue
    byId.set(item.id, { ...item })
  }
  for (const item of server) {
    if (!item?.id || removed.has(item.id) || isBrokenCatalogNewProduct(item)) continue
    byId.set(item.id, overlayProduct(byId.get(item.id), item))
  }
  if (Array.isArray(local)) {
    for (const item of local) {
      if (!item?.id || removed.has(item.id) || isBrokenCatalogNewProduct(item)) continue
      byId.set(item.id, overlayProduct(byId.get(item.id), item))
    }
  }
  return [...byId.values()].map((item) => withSlugs(item))
}

function readCustomCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(CAT_KEY) || '[]')
    if (Array.isArray(saved)) return saved.map((item) => asCategoryGroup(item.name, item.children, item.icon))
  } catch {
    /* keep empty */
  }
  return []
}

function normalizeBrandName(value) {
  return String(value || '').trim()
}

function readCustomBrands() {
  try {
    const raw = localStorage.getItem(BRAND_KEY)
    if (raw === null) {
      const seeded = seedBrandNames()
      localStorage.setItem(BRAND_KEY, JSON.stringify(seeded))
      return seeded
    }
    const saved = JSON.parse(raw || '[]')
    if (Array.isArray(saved)) {
      return [...new Set(saved.map(normalizeBrandName).filter(Boolean))]
    }
  } catch {
    /* keep empty */
  }
  return []
}

function seedBrandNames() {
  return seedBrands.map((item) => normalizeBrandName(item.name)).filter(Boolean)
}

function readHiddenCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_CAT_KEY) || '[]')
    if (Array.isArray(saved)) return [...new Set(saved.map(String).filter(Boolean))]
  } catch {
    /* keep empty */
  }
  return []
}

function readHiddenSubcategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_SUB_KEY) || '{}')
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      const next = {}
      for (const [key, value] of Object.entries(saved)) {
        if (!Array.isArray(value)) continue
        next[key] = [...new Set(value.map(String).filter(Boolean))]
      }
      return next
    }
  } catch {
    /* keep empty */
  }
  return {}
}

function mergeCategories(custom, products, hiddenCategories = [], hiddenSubcategories = {}) {
  const hiddenCats = new Set(hiddenCategories.map(String))
  const map = new Map()
  for (const group of categoryTree) {
    map.set(group.name, {
      ...group,
      children: group.children.map((child) => ({ ...child })),
    })
  }
  for (const group of custom) {
    const name = String(group?.name || '').trim()
    if (!name) continue
    const incoming = asCategoryGroup(name, group.children, group.icon)
    const existing = map.get(name)
    if (!existing) {
      map.set(name, incoming)
      continue
    }
    const seen = new Set(existing.children.map((child) => child.name))
    for (const child of incoming.children) {
      if (!seen.has(child.name)) {
        existing.children.push(child)
        seen.add(child.name)
      }
    }
  }
  for (const product of products) {
    const name = String(product?.category || '').trim()
    if (!name) continue
    if (!map.has(name)) {
      map.set(name, asCategoryGroup(name, product.subcategory ? [product.subcategory] : []))
      continue
    }
    if (
      product.subcategory &&
      !map.get(name).children.some((child) => child.name === product.subcategory)
    ) {
      map.get(name).children.push({
        name: product.subcategory,
        slug: slugify(product.subcategory),
      })
    }
  }
  return [...map.values()]
    .filter((group) => !hiddenCats.has(group.name))
    .map((group) => {
      const hiddenKids = new Set((hiddenSubcategories[group.name] || []).map(String))
      return {
        ...group,
        children: group.children.filter((child) => !hiddenKids.has(child.name)),
      }
    })
}

function isUploadedSrc(src) {
  const value = String(src || '')
  return value.startsWith('data:') || value.startsWith('/uploads/') || value.startsWith('blob:')
}

function withSlugs(product) {
  const source = catalog.find((item) => item.id === product.id)
  const sizes = Array.isArray(product.sizes)
    ? product.sizes.map((item) => String(item || '').trim()).filter(Boolean)
    : Array.isArray(source?.sizes)
      ? source.sizes
      : []
  return {
    ...source,
    ...product,
    colors: product.colors?.length ? product.colors : source?.colors || [],
    sizes,
    categorySlug: slugify(product.category || source?.category || ''),
    subcategorySlug: slugify(product.subcategory || source?.subcategory || ''),
  }
}

function uniqueImages(list) {
  return [...new Set((list || []).filter(Boolean))]
}

function pickMedia(catalogItem, saved) {
  if (!saved) return { image: catalogItem.image, gallery: catalogItem.gallery }
  const savedGallery = Array.isArray(saved.gallery) ? saved.gallery.filter(Boolean) : []
  const hasUpload = [saved.image, ...savedGallery].some(isUploadedSrc)
  if (!hasUpload && savedGallery.length <= (catalogItem.gallery?.length || 0)) {
    return { image: catalogItem.image, gallery: catalogItem.gallery }
  }
  const gallery = uniqueImages([saved.image, ...savedGallery])
  return {
    image: saved.image || gallery[0] || catalogItem.image,
    gallery: gallery.length ? gallery : catalogItem.gallery,
  }
}

function newestStamp(item) {
  const created = Date.parse(item?.createdAt || '')
  if (Number.isFinite(created)) return created
  const match = String(item?.id || '').match(/^p-(\d{10,})$/)
  return match ? Number(match[1]) : 0
}

function readProducts() {
  return assembleProducts([])
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: readProducts(),
    customCategories: readCustomCategories(),
    customBrands: readCustomBrands(),
    hiddenCategories: readHiddenCategories(),
    hiddenSubcategories: readHiddenSubcategories(),
    removedIds: readRemovedIds(),
    loading: false,
  }),
  getters: {
    featured: (state) => state.products.filter((item) => item.featured),
    popular: (state) => state.products.filter((item) => item.popular),
    newest: (state) => {
      const items = state.products.filter((item) => item?.image)
      return [...items].sort((a, b) => newestStamp(b) - newestStamp(a)).slice(0, 24)
    },
    lowStock: (state) =>
      state.products.filter((item) => {
        const qty = stockQuantity(item.stock)
        return qty !== null && qty > 0 && qty <= 8
      }),
    categories: (state) =>
      mergeCategories(
        state.customCategories,
        state.products,
        state.hiddenCategories,
        state.hiddenSubcategories,
      ),
    brands: (state) => {
      const names = new Set([
        ...state.customBrands,
        ...state.products.map((item) => normalizeBrandName(item.brand)).filter(Boolean),
      ])
      return [...names].sort((a, b) => a.localeCompare(b, 'fa'))
    },
    bySlug: (state) => (slug) => state.products.find((item) => item.slug === slug),
    byId: (state) => (id) => state.products.find((item) => item.id === id),
    byCategory: (state) => (categorySlug) =>
      state.products.filter(
        (item) =>
          item.categorySlug === categorySlug ||
          item.subcategorySlug === categorySlug ||
          slugify(item.category) === categorySlug ||
          slugify(item.subcategory) === categorySlug,
      ),
    search: (state) => (query) => {
      const q = query.trim()
      if (!q) return state.products
      return state.products.filter((item) =>
        `${item.title} ${item.category} ${item.subcategory} ${item.brand || ''}`.includes(q),
      )
    },
  },
  actions: {
    async flushRemovedToServer(serverSnapshot = []) {
      const auth = useAuthStore()
      if (!auth.online || !auth.isAdmin) return
      const removed = new Set((this.removedIds?.length ? this.removedIds : readRemovedIds()).map(String))
      if (!removed.size) return
      const stillOnServer = (serverSnapshot || []).filter((item) => item?.id && removed.has(String(item.id)))
      for (const item of stillOnServer) {
        await this.removeOneRemote(String(item.id))
      }
    },
    async hydrate() {
      try {
        const { data } = await api.get('/products', { timeout: 120000 })
        if (Array.isArray(data)) {
          const removed = new Set(readRemovedIds())
          this.removedIds = [...removed]
          // حذف‌های گوشی/آفلاین را روی سرور هم اعمال کن تا دوباره بالا نیایند
          await this.flushRemovedToServer(data)
          const { data: fresh } = await api.get('/products', { timeout: 120000 }).catch(() => ({ data }))
          const source = Array.isArray(fresh) ? fresh : data
          const serverList = source
            .filter((item) => item?.id && !removed.has(String(item.id)) && !isBrokenCatalogNewProduct(item))
            .map((item) => withSlugs({ ...item, pendingSync: false }))
          const serverIds = new Set(serverList.map((item) => String(item.id)))
          // حافظه + localStorage: محصول تازه‌ثبت‌شده روی گوشی را با hydrate پاک نکن
          const localExtras = collectLocalExtras(
            [...(this.products || []), ...(readSavedProducts() || [])],
            removed,
            serverIds,
          )
          this.products = [...localExtras.map((item) => withSlugs(item)), ...serverList]
          this.removedIds = [...removed]
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightForStorage(this.products)))
            localStorage.setItem(REMOVED_KEY, JSON.stringify(this.removedIds))
          } catch {
            /* keep in memory */
          }
          if (localExtras.length) {
            await this.persist()
          }
          return
        }
      } catch {
        /* fall through to local-only — اما لیست فعلی حافظه را دور نریز */
      }
      // اگر API در دسترس نبود، کاتالوگ اولیه را روی کار کاربر سوار نکن
      const removed = new Set(readRemovedIds())
      const memory = Array.isArray(this.products) ? this.products : []
      const local = readSavedProducts()
      const merged = collectLocalExtras(
        [...memory, ...(Array.isArray(local) ? local : [])],
        removed,
        new Set(),
      )
      // اگر حافظه/لوکال چیزی دارد، همان را نگه دار (حتی محصولات sync‌شده)
      const fallbackSource =
        memory.length
          ? memory
          : Array.isArray(local) && local.length
            ? local
            : null
      if (fallbackSource) {
        const byId = new Map()
        for (const item of fallbackSource) {
          if (!item?.id || removed.has(String(item.id)) || isBrokenCatalogNewProduct(item)) continue
          byId.set(String(item.id), withSlugs(item))
        }
        for (const item of merged) {
          byId.set(String(item.id), withSlugs(item))
        }
        this.products = [...byId.values()]
        this.removedIds = [...removed]
        return
      }
      this.products = assembleProducts([])
      this.removedIds = [...removed]
    },
    async persistLocal() {
      const cleaned = this.products.filter((item) => !isBrokenCatalogNewProduct(item))
      this.products = cleaned
      this.removedIds = [...new Set((this.removedIds || []).map(String).filter(Boolean))]
      const full = JSON.stringify(cleaned)
      const light = JSON.stringify(lightweightForStorage(cleaned))
      try {
        localStorage.setItem(STORAGE_KEY, full)
      } catch {
        try {
          // روی موبایل عکس base64 جا نمی‌شود؛ نسخه سبک بدون data URL
          localStorage.setItem(STORAGE_KEY, light)
        } catch {
          /* quota: keep in-memory list so the dashboard still shows the change */
        }
      }
      try {
        localStorage.setItem(CAT_KEY, JSON.stringify(this.customCategories))
        localStorage.setItem(BRAND_KEY, JSON.stringify(this.customBrands))
        localStorage.setItem(HIDDEN_CAT_KEY, JSON.stringify(this.hiddenCategories))
        localStorage.setItem(HIDDEN_SUB_KEY, JSON.stringify(this.hiddenSubcategories))
        localStorage.setItem(REMOVED_KEY, JSON.stringify(this.removedIds))
      } catch {
        /* ignore secondary quota */
      }
      return cleaned
    },
    async persist() {
      await this.persistLocal()
      const auth = useAuthStore()
      if (!auth.online || !auth.isAdmin) {
        return { ok: false, reason: 'offline' }
      }
      try {
        await api.put('/products', this.products, { timeout: 120000 })
        return { ok: true }
      } catch (err) {
        const status = err?.response?.status
        const message =
          status === 413 || status === 400
            ? 'حجم عکس‌ها زیاد است؛ عکس کوچک‌تر بگذار یا تعداد را کم کن.'
            : status
              ? `خطای سرور (${status}): ${err?.response?.data?.message || err?.message || 'ذخیره انجام نشد.'}`
              : err?.response?.data?.message || err?.message || 'ذخیره روی سرور انجام نشد.'
        return { ok: false, reason: 'api', message, status }
      }
    },
    /** Fast path: sync one product instead of the whole catalog. */
    async uploadImages(list, prefix = 'product') {
      const auth = useAuthStore()
      const items = (list || []).map((item) => String(item || '')).filter(Boolean)
      if (!items.length) return { ok: false, reason: 'api', message: 'عکسی برای آپلود نیست.', urls: [] }
      if (!auth.online || !auth.isAdmin) {
        return { ok: false, reason: 'offline', urls: items }
      }
      const urls = []
      for (const src of items) {
        if (src.startsWith('/uploads/') || (!src.startsWith('data:') && !src.startsWith('blob:'))) {
          urls.push(src)
          continue
        }
        try {
          const { data } = await api.post(
            '/uploads',
            { dataUrl: src, prefix },
            { timeout: 90000 },
          )
          if (!data?.url) {
            return { ok: false, reason: 'api', message: 'آپلود یکی از عکس‌ها ناموفق بود.', urls }
          }
          urls.push(data.url)
        } catch (err) {
          const status = err?.response?.status
          const message = !err?.response
            ? 'اتصال شبکه قطع شد. API را روشن نگه دار و دوباره ذخیره بزن.'
            : status === 413 || status === 400
              ? 'حجم عکس زیاد است؛ عکس کوچک‌تر بگذار.'
              : err?.response?.data?.message || err?.message || 'آپلود عکس انجام نشد.'
          return { ok: false, reason: err?.response ? 'api' : 'offline', message, status, urls }
        }
      }
      return { ok: true, urls }
    },
    async persistOne(product) {
      await this.persistLocal()
      const auth = useAuthStore()
      if (!auth.online || !auth.isAdmin) {
        return { ok: false, reason: 'offline' }
      }
      if (!product?.id) {
        return { ok: false, reason: 'api', message: 'شناسه محصول نامعتبر است.' }
      }
      try {
        const { data } = await api.put(`/products/${encodeURIComponent(product.id)}`, product, {
          timeout: 120000,
        })
        // سرور عکس‌ها را به /uploads تبدیل می‌کند — همان نسخه سبک را در استور بنشان
        if (data?.id) {
          const synced = withSlugs({ ...product, ...data, pendingSync: false })
          const idx = this.products.findIndex((item) => String(item.id) === String(synced.id))
          if (idx >= 0) this.products[idx] = { ...this.products[idx], ...synced }
          else this.products.unshift(synced)
          await this.persistLocal()
          return { ok: true, product: synced }
        }
        return { ok: true }
      } catch (err) {
        // Older API without single-product route — fall back once
        if (err?.response?.status === 404) {
          return this.persist()
        }
        const status = err?.response?.status
        const message =
          !err?.response
            ? 'اتصال به سرور قطع شد (Network Error). اینترنت/API را چک کن و دوباره ذخیره بزن.'
            : status === 413 || status === 400
              ? 'حجم عکس‌ها زیاد است؛ عکس کوچک‌تر بگذار یا تعداد را کم کن.'
              : status
                ? `خطای سرور (${status}): ${err?.response?.data?.message || err?.message || 'ذخیره انجام نشد.'}`
                : err?.response?.data?.message || err?.message || 'ذخیره روی سرور انجام نشد.'
        return { ok: false, reason: err?.response ? 'api' : 'offline', message, status }
      }
    },
    async removeOneRemote(id) {
      const auth = useAuthStore()
      if (!auth.online || !auth.isAdmin) return { ok: false, reason: 'offline' }
      try {
        await api.delete(`/products/${encodeURIComponent(id)}`, { timeout: 30000 })
        return { ok: true }
      } catch (err) {
        if (err?.response?.status === 404) return this.persist()
        const status = err?.response?.status
        const message =
          err?.response?.data?.message || err?.message || 'حذف روی سرور انجام نشد.'
        return { ok: false, reason: 'api', message, status }
      }
    },
    persistCategories() {
      localStorage.setItem(CAT_KEY, JSON.stringify(this.customCategories))
      localStorage.setItem(HIDDEN_CAT_KEY, JSON.stringify(this.hiddenCategories))
      localStorage.setItem(HIDDEN_SUB_KEY, JSON.stringify(this.hiddenSubcategories))
    },
    persistBrands() {
      localStorage.setItem(BRAND_KEY, JSON.stringify(this.customBrands))
    },
    addBrand(name) {
      const trimmed = normalizeBrandName(name)
      if (!trimmed) return null
      if (!this.customBrands.includes(trimmed)) {
        this.customBrands.push(trimmed)
        this.persistBrands()
      }
      return trimmed
    },
    renameBrand(oldName, newName) {
      const from = normalizeBrandName(oldName)
      const to = normalizeBrandName(newName)
      if (!from || !to) return false
      if (from === to) return true
      if (this.brands.some((item) => item === to && item !== from)) return false
      const idx = this.customBrands.indexOf(from)
      if (idx >= 0) this.customBrands[idx] = to
      else if (!this.customBrands.includes(to)) this.customBrands.push(to)
      for (const product of this.products) {
        if (normalizeBrandName(product.brand) === from) product.brand = to
      }
      this.persistBrands()
      this.persist()
      return true
    },
    removeBrand(name) {
      const trimmed = normalizeBrandName(name)
      if (!trimmed) return false
      this.customBrands = this.customBrands.filter((item) => item !== trimmed)
      for (const product of this.products) {
        if (normalizeBrandName(product.brand) === trimmed) product.brand = ''
      }
      this.persistBrands()
      this.persist()
      return true
    },
    ensureCustomCategory(name) {
      const trimmed = String(name || '').trim()
      if (!trimmed) return null
      let existing = this.customCategories.find((item) => item.name === trimmed)
      if (existing) return existing
      const fromMerged = this.categories.find((item) => item.name === trimmed)
      existing = asCategoryGroup(
        trimmed,
        fromMerged?.children?.map((child) => child.name) || [],
        fromMerged?.icon,
      )
      this.customCategories.push(existing)
      return existing
    },
    addCategory(name, subcategory = '') {
      const trimmed = String(name || '').trim()
      if (!trimmed) return null
      const child = String(subcategory || '').trim()
      this.hiddenCategories = this.hiddenCategories.filter((item) => item !== trimmed)
      const existing = this.ensureCustomCategory(trimmed)
      if (child) {
        const hiddenKids = this.hiddenSubcategories[trimmed] || []
        this.hiddenSubcategories = {
          ...this.hiddenSubcategories,
          [trimmed]: hiddenKids.filter((item) => item !== child),
        }
        if (!existing.children.some((item) => item.name === child)) {
          existing.children.push({ name: child, slug: slugify(child) })
        }
      }
      this.persistCategories()
      return trimmed
    },
    renameCategory(oldName, newName) {
      const from = String(oldName || '').trim()
      const to = String(newName || '').trim()
      if (!from || !to) return false
      if (from === to) return true
      if (this.categories.some((item) => item.name === to)) return false
      const source = this.categories.find((item) => item.name === from)
      const kids = source?.children?.map((child) => child.name) || []
      this.ensureCustomCategory(from)
      const custom = this.customCategories.find((item) => item.name === from)
      if (custom) {
        custom.name = to
        custom.slug = slugify(to)
        custom.children = asCategoryGroup(to, kids, custom.icon).children
      } else {
        this.customCategories.push(asCategoryGroup(to, kids, source?.icon))
      }
      const wasBuiltin = categoryTree.some((item) => item.name === from)
      if (wasBuiltin && !this.hiddenCategories.includes(from)) {
        this.hiddenCategories.push(from)
      }
      this.hiddenCategories = this.hiddenCategories.filter((item) => item !== to)
      if (this.hiddenSubcategories[from]) {
        this.hiddenSubcategories = {
          ...this.hiddenSubcategories,
          [to]: this.hiddenSubcategories[from],
        }
        delete this.hiddenSubcategories[from]
      }
      for (const product of this.products) {
        if (product.category === from) {
          product.category = to
          product.categorySlug = slugify(to)
        }
      }
      this.persistCategories()
      this.persist()
      return true
    },
    removeCategory(name) {
      const trimmed = String(name || '').trim()
      if (!trimmed) return false
      const remaining = this.categories.filter((item) => item.name !== trimmed)
      const fallback = remaining[0]
      this.customCategories = this.customCategories.filter((item) => item.name !== trimmed)
      if (!this.hiddenCategories.includes(trimmed)) this.hiddenCategories.push(trimmed)
      delete this.hiddenSubcategories[trimmed]
      for (const product of this.products) {
        if (product.category !== trimmed) continue
        if (fallback) {
          product.category = fallback.name
          product.categorySlug = slugify(fallback.name)
          product.subcategory = fallback.children[0]?.name || fallback.name
          product.subcategorySlug = slugify(product.subcategory)
        }
      }
      this.persistCategories()
      this.persist()
      return true
    },
    renameSubcategory(categoryName, oldName, newName) {
      const cat = String(categoryName || '').trim()
      const from = String(oldName || '').trim()
      const to = String(newName || '').trim()
      if (!cat || !from || !to) return false
      if (from === to) return true
      const group = this.categories.find((item) => item.name === cat)
      if (group?.children?.some((child) => child.name === to)) return false
      const custom = this.ensureCustomCategory(cat)
      const child = custom.children.find((item) => item.name === from)
      if (child) {
        child.name = to
        child.slug = slugify(to)
      } else {
        custom.children.push({ name: to, slug: slugify(to) })
      }
      const hiddenKids = this.hiddenSubcategories[cat] || []
      this.hiddenSubcategories = {
        ...this.hiddenSubcategories,
        [cat]: [...new Set([...hiddenKids.filter((item) => item !== to), from])],
      }
      for (const product of this.products) {
        if (product.category === cat && product.subcategory === from) {
          product.subcategory = to
          product.subcategorySlug = slugify(to)
        }
      }
      this.persistCategories()
      this.persist()
      return true
    },
    removeSubcategory(categoryName, name) {
      const cat = String(categoryName || '').trim()
      const trimmed = String(name || '').trim()
      if (!cat || !trimmed) return false
      const custom = this.customCategories.find((item) => item.name === cat)
      if (custom) {
        custom.children = custom.children.filter((item) => item.name !== trimmed)
      }
      const hiddenKids = this.hiddenSubcategories[cat] || []
      this.hiddenSubcategories = {
        ...this.hiddenSubcategories,
        [cat]: [...new Set([...hiddenKids, trimmed])],
      }
      const group = this.categories.find((item) => item.name === cat)
      const fallback = group?.children?.[0]?.name || cat
      for (const product of this.products) {
        if (product.category === cat && product.subcategory === trimmed) {
          product.subcategory = fallback
          product.subcategorySlug = slugify(fallback)
        }
      }
      this.persistCategories()
      this.persist()
      return true
    },
    async upsert(payload) {
      const gallery = [
        ...new Set(
          (Array.isArray(payload.gallery) && payload.gallery.length
            ? payload.gallery
            : [payload.image]
          ).filter(Boolean),
        ),
      ]
      const existing = payload.id ? this.products.find((item) => item.id === payload.id) : null
      const next = withSlugs({
        sizes: [],
        stock: 0,
        brand: '',
        featured: false,
        popular: false,
        description: '',
        priceOnRequest: false,
        discountPercent: 0,
        features: [],
        ...payload,
        colors: Array.isArray(payload.colors) ? payload.colors : existing?.colors || [],
        sizes: Array.isArray(payload.sizes)
          ? payload.sizes.map((item) => String(item || '').trim()).filter(Boolean)
          : [],
        brand: normalizeBrandName(payload.brand),
        gallery,
        image: payload.image || gallery[0] || '',
        slug: payload.slug || slugify(payload.title),
        id: payload.id || `p-${Date.now()}`,
        createdAt: existing?.createdAt || payload.createdAt || (!existing ? new Date().toISOString() : undefined),
        pendingSync: true,
      })
      if (isBrokenCatalogNewProduct(next)) return { product: null, persist: { ok: false, reason: 'rejected' } }
      if (!next.gallery?.length && next.image) next.gallery = [next.image]
      if (next.brand) this.addBrand(next.brand)
      this.removedIds = (this.removedIds || []).filter((item) => String(item) !== String(next.id))
      const index = this.products.findIndex((item) => item.id === next.id)
      if (index >= 0) this.products[index] = { ...this.products[index], ...next }
      else this.products.unshift(next)
      const persist = await this.persistOne(next)
      if (persist?.ok) {
        const synced = persist.product || { ...next, pendingSync: false }
        next.pendingSync = false
        if (synced.image) next.image = synced.image
        if (synced.gallery) next.gallery = synced.gallery
        const syncedIndex = this.products.findIndex((item) => item.id === next.id)
        if (syncedIndex >= 0) {
          this.products[syncedIndex] = {
            ...this.products[syncedIndex],
            ...synced,
            pendingSync: false,
          }
        }
        await this.persistLocal()
      }
      return { product: next, persist }
    },
    async remove(id) {
      const targetId = String(id || '')
      if (!targetId) return { ok: false, reason: 'api', message: 'شناسه نامعتبر است.' }
      this.products = this.products.filter((item) => String(item.id) !== targetId)
      if (!this.removedIds.includes(targetId)) this.removedIds.push(targetId)
      await this.persistLocal()
      const remote = await this.removeOneRemote(targetId)
      if (remote?.ok) return remote
      // اگر حذف تکی نشد، کل لیست فعلی (بدون آن محصول) را به سرور بفرست
      const full = await this.persist()
      return full
    },
    resetCatalog() {
      this.products = catalog.map((item) => ({ ...item }))
      this.customCategories = []
      this.customBrands = seedBrandNames()
      this.hiddenCategories = []
      this.hiddenSubcategories = {}
      this.removedIds = []
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(CAT_KEY)
      localStorage.setItem(BRAND_KEY, JSON.stringify(this.customBrands))
      localStorage.removeItem(HIDDEN_CAT_KEY)
      localStorage.removeItem(HIDDEN_SUB_KEY)
      localStorage.removeItem(REMOVED_KEY)
      localStorage.setItem(CATALOG_EPOCH_KEY, CATALOG_EPOCH)
    },
  },
})
