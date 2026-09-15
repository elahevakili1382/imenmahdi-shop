import { defineStore } from 'pinia'
import { toNumber } from '@/utils/money'

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
      if (Number(product.stock) <= 0) return false
      const size = product.size || product.sizes?.[0] || 'یک سایز'
      const existing = this.items.find((item) => item.id === product.id && item.size === size)
      if (existing) {
        existing.quantity += product.quantity || 1
      } else {
        this.items.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          image: product.image,
          size,
          quantity: product.quantity || 1,
        })
      }
      this.persist()
      return true
    },
    updateQuantity(id, size, quantity) {
      const item = this.items.find((row) => row.id === id && row.size === size)
      if (!item) return
      item.quantity = Math.max(1, quantity)
      this.persist()
    },
    changeQuantity(id, size, delta) {
      const item = this.items.find((row) => row.id === id && row.size === size)
      if (!item) return
      item.quantity = Math.max(1, item.quantity + delta)
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
