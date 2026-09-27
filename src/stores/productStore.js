import { defineStore } from 'pinia'
import { products as catalog, categoryTree } from '@/data/catalog'
import { slugify } from '@/utils/slugify'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { stockQuantity } from '@/utils/stock'

const STORAGE_KEY = 'imenmahdi-products'
const CAT_KEY = 'imenmahdi-custom-categories'
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
  return {
    ...source,
    ...product,
    colors: product.colors?.length ? product.colors : source?.colors || ['مشکی'],
    sizes: product.sizes?.length ? product.sizes : source?.sizes || ['یک سایز'],
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
        `${item.title} ${item.category} ${item.subcategory}`.includes(q),
      )
    },
  },
  actions: {
    async hydrate() {
      try {
        const { data } = await api.get('/products')
        if (Array.isArray(data)) {
          const removed = new Set(readRemovedIds())
          const serverList = data
            .filter((item) => item?.id && !removed.has(item.id) && !isBrokenCatalogNewProduct(item))
            .map((item) => withSlugs(item))
          const serverIds = new Set(serverList.map((item) => item.id))
          const localExtras = (readSavedProducts() || []).filter(
            (item) =>
              item?.id &&
              !serverIds.has(item.id) &&
              !removed.has(item.id) &&
              !isBrokenCatalogNewProduct(item),
          )
          // محصولاتی که هنوز به سرور نرسیده‌اند را دور نریز
          this.products = [...localExtras.map((item) => withSlugs(item)), ...serverList]
          this.removedIds = [...removed]
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products))
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
        /* fall through */
      }
      this.products = assembleProducts([])
    },
    async persist() {
      const cleaned = this.products.filter((item) => !isBrokenCatalogNewProduct(item))
      this.products = cleaned
      this.removedIds = [...new Set((this.removedIds || []).map(String).filter(Boolean))]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
        localStorage.setItem(CAT_KEY, JSON.stringify(this.customCategories))
        localStorage.setItem(HIDDEN_CAT_KEY, JSON.stringify(this.hiddenCategories))
        localStorage.setItem(HIDDEN_SUB_KEY, JSON.stringify(this.hiddenSubcategories))
        localStorage.setItem(REMOVED_KEY, JSON.stringify(this.removedIds))
      } catch {
        /* quota: keep in-memory list so the dashboard still shows the change */
      }
      const auth = useAuthStore()
      if (!auth.online || !auth.isAdmin) {
        return { ok: false, reason: 'offline' }
      }
      try {
        await api.put('/products', cleaned)
        return { ok: true }
      } catch (err) {
        const status = err?.response?.status
        const message =
          status === 413
            ? 'حجم عکس‌ها زیاد است؛ عکس کوچک‌تر بگذار یا تعداد را کم کن.'
            : err?.response?.data?.message || err?.message || 'ذخیره روی سرور انجام نشد.'
        return { ok: false, reason: 'api', message }
      }
    },
    persistCategories() {
      localStorage.setItem(CAT_KEY, JSON.stringify(this.customCategories))
      localStorage.setItem(HIDDEN_CAT_KEY, JSON.stringify(this.hiddenCategories))
      localStorage.setItem(HIDDEN_SUB_KEY, JSON.stringify(this.hiddenSubcategories))
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
        sizes: ['یک سایز'],
        stock: 0,
        featured: false,
        popular: false,
        description: '',
        priceOnRequest: false,
        discountPercent: 0,
        features: [],
        ...payload,
        gallery,
        image: payload.image || gallery[0] || '',
        slug: payload.slug || slugify(payload.title),
        id: payload.id || `p-${Date.now()}`,
        createdAt: existing?.createdAt || payload.createdAt || (!existing ? new Date().toISOString() : undefined),
      })
      if (isBrokenCatalogNewProduct(next)) return { product: null, persist: { ok: false, reason: 'rejected' } }
      if (!next.gallery?.length && next.image) next.gallery = [next.image]
      this.removedIds = (this.removedIds || []).filter((item) => item !== next.id)
      const index = this.products.findIndex((item) => item.id === next.id)
      if (index >= 0) this.products[index] = { ...this.products[index], ...next }
      else this.products.unshift(next)
      const persist = await this.persist()
      return { product: next, persist }
    },
    async remove(id) {
      this.products = this.products.filter((item) => item.id !== id)
      if (id && !this.removedIds.includes(id)) this.removedIds.push(id)
      return this.persist()
    },
    resetCatalog() {
      this.products = catalog.map((item) => ({ ...item }))
      this.customCategories = []
      this.hiddenCategories = []
      this.hiddenSubcategories = {}
      this.removedIds = []
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(CAT_KEY)
      localStorage.removeItem(HIDDEN_CAT_KEY)
      localStorage.removeItem(HIDDEN_SUB_KEY)
      localStorage.removeItem(REMOVED_KEY)
      localStorage.setItem(CATALOG_EPOCH_KEY, CATALOG_EPOCH)
    },
  },
})
