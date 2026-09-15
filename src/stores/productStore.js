import { defineStore } from 'pinia'
import { products as catalog, categoryTree } from '@/data/catalog'
import { slugify } from '@/utils/slugify'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

const STORAGE_KEY = 'imenmahdi-products'

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

function readProducts() {
  const fresh = catalog.map((item) => ({ ...item }))
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!Array.isArray(saved) || !saved.length) return fresh
    const byId = new Map(saved.map((item) => [item.id, item]))
    const merged = fresh.map((item) =>
      withSlugs({
        ...item,
        ...byId.get(item.id),
        image: item.image,
        gallery: item.gallery,
        colors: item.colors,
        features: item.features,
        specs: item.specs,
        sku: item.sku,
      }),
    )
    const extras = saved.filter((item) => !catalog.some((row) => row.id === item.id)).map(withSlugs)
    return [...merged, ...extras]
  } catch {
    return fresh
  }
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: readProducts(),
    loading: false,
  }),
  getters: {
    featured: (state) => state.products.filter((item) => item.featured),
    popular: (state) => state.products.filter((item) => item.popular),
    lowStock: (state) => state.products.filter((item) => Number(item.stock) <= 8),
    categories: () => categoryTree,
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
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products))
      const auth = useAuthStore()
      if (auth.online && auth.isAdmin) {
        api.put('/products', this.products).catch(() => {})
      }
    },
    async hydrate() {
      try {
        const { data } = await api.get('/products')
        if (Array.isArray(data) && data.length) {
          const byId = new Map(data.map((item) => [item.id, item]))
          const merged = catalog.map((item) =>
            withSlugs({
              ...item,
              ...byId.get(item.id),
              image: item.image,
              gallery: item.gallery,
              colors: item.colors,
              features: item.features,
              specs: item.specs,
              sku: item.sku,
            }),
          )
          const extras = data.filter((item) => !catalog.some((row) => row.id === item.id)).map(withSlugs)
          this.products = [...merged, ...extras]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products))
        }
      } catch {
        /* keep catalog */
      }
    },
    upsert(payload) {
      const next = withSlugs({
        sizes: ['یک سایز'],
        gallery: payload.image ? [payload.image] : [],
        stock: 0,
        featured: false,
        popular: false,
        description: '',
        ...payload,
        slug: payload.slug || slugify(payload.title),
        id: payload.id || `p-${Date.now()}`,
      })
      if (!next.gallery?.length && next.image) next.gallery = [next.image]
      const index = this.products.findIndex((item) => item.id === next.id)
      if (index >= 0) this.products[index] = { ...this.products[index], ...next }
      else this.products.unshift(next)
      this.persist()
      return next
    },
    remove(id) {
      this.products = this.products.filter((item) => item.id !== id)
      this.persist()
    },
    resetCatalog() {
      this.products = catalog.map((item) => ({ ...item }))
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
