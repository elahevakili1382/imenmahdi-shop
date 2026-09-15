import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

const STORAGE_KEY = 'imenmahdi-reviews'

function readReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export const useReviewStore = defineStore('reviews', {
  state: () => ({
    reviews: readReviews(),
  }),
  getters: {
    approved: (state) => state.reviews.filter((item) => item.status === 'approved'),
    pending: (state) => state.reviews.filter((item) => item.status === 'pending'),
    byUser: (state) => (userId) => state.reviews.filter((item) => item.userId === userId),
    hasForOrder: (state) => (orderId) => state.reviews.some((item) => item.orderId === orderId),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reviews))
    },
    async hydrate() {
      try {
        const { data } = await api.get('/reviews')
        if (Array.isArray(data)) {
          this.reviews = data
          this.persist()
        }
      } catch {
        /* keep local */
      }
    },
    async submit({ user, order, text, rating }) {
      if (!user || !order || this.hasForOrder(order.id)) return null
      const review = {
        id: `rev-${Date.now()}`,
        userId: user.id,
        name: user.name || 'خریدار',
        city: order.city || '',
        product: order.items?.[0]?.title || 'سفارش فروشگاه',
        orderId: order.id,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        text: String(text || '').trim(),
        date: new Date().toLocaleDateString('fa-IR'),
        createdAt: new Date().toISOString(),
        status: 'pending',
      }
      this.reviews.unshift(review)
      this.persist()
      const auth = useAuthStore()
      if (auth.online) {
        try {
          const { data } = await api.post('/reviews', review)
          this.reviews = [data, ...this.reviews.filter((item) => item.orderId !== data.orderId)]
          this.persist()
          return data
        } catch {
          return null
        }
      }
      return review
    },
    async setStatus(id, status) {
      const review = this.reviews.find((item) => item.id === id)
      if (!review) return
      review.status = status
      this.persist()
      const auth = useAuthStore()
      if (auth.online) await api.patch(`/reviews/${id}`, { status }).catch(() => {})
    },
    async remove(id) {
      this.reviews = this.reviews.filter((item) => item.id !== id)
      this.persist()
      const auth = useAuthStore()
      if (auth.online) await api.delete(`/reviews/${id}`).catch(() => {})
    },
  },
})
