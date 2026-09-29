import { defineStore } from 'pinia'
import { toNumber, salePrice } from '@/utils/money'
import { isOutOfStock, maxOrderQty } from '@/utils/stock'

const STORAGE_KEY = 'imenmahdi-cart'

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: readCart(),
  }),
  getters: {
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },
    addToCart(product) {
      if (product.priceOnRequest) return false
      if (isOutOfStock(product)) return false
      const size = product.size || product.sizes?.[0] || ''
      const existing = this.items.find((item) => item.id === product.id && item.size === size)
      const incoming = Math.max(1, Number(product.quantity) || 1)
      const room = maxOrderQty(product)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + incoming, room || existing.quantity + incoming)
      } else {
        this.items.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: salePrice(product),
          image: product.image,
          badge: product.badge || '',
          size,
          quantity: Math.min(incoming, room || incoming),
        })
      }
      this.persist()
      return true
    },
    updateQuantity(id, size, quantity) {
      const item = this.items.find((row) => row.id === id && row.size === size)
      if (!item) return
      if (quantity <= 0) {
        this.removeFromCart(id, size)
        return
      }
      item.quantity = quantity
      this.persist()
    },
    changeQuantity(id, size, delta) {
      const item = this.items.find((row) => row.id === id && row.size === size)
      if (!item) return
      const next = item.quantity + delta
      if (next <= 0) {
        this.removeFromCart(id, size)
        return
      }
      item.quantity = next
      this.persist()
    },
    removeFromCart(id, size) {
      this.items = this.items.filter((item) => !(item.id === id && item.size === size))
      this.persist()
    },
    clearCart() {
      this.items = []
      this.persist()
    },
  },
})
