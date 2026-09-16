import { defineStore } from 'pinia'
import { uniqueOrderId } from '@/utils/ids'
import { shopBank } from '@/data/bank'
import { useShippingStore } from '@/stores/shippingStore'
import { ORDER_STATUS } from '@/data/orderStatus'
import { api, apiError } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export { ORDER_STATUS } from '@/data/orderStatus'

const STORAGE_KEY = 'imenmahdi-orders'

function nextOrderId(orders) {
  return uniqueOrderId(orders.map((order) => order.id))
}

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function replaceList(list, order) {
  const index = list.findIndex((item) => item.id === order.id)
  if (index >= 0) list[index] = order
  else list.unshift(order)
  return list
}

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: readOrders(),
  }),
  getters: {
    byUser: (state) => (userId) => state.orders.filter((order) => order.userId === userId),
    pendingReview: (state) =>
      state.orders.filter((order) => order.status === ORDER_STATUS.AWAITING_REVIEW),
    byId: (state) => (id) => state.orders.find((order) => order.id === id),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders))
    },
    async hydrate() {
      const auth = useAuthStore()
      if (!auth.online || !auth.isLoggedIn) return
      try {
        const { data } = await api.get('/orders')
        if (Array.isArray(data)) {
          this.orders = data
          this.persist()
        }
      } catch {
        /* keep local */
      }
    },
    async createOrder({
      user,
      items,
      subtotal,
      shippingId,
      city,
      address,
      note,
      destination = 'county',
      deliveryDate = '',
      deliverySlot = '',
    }) {
      const auth = useAuthStore()
      if (auth.online) {
        try {
          const { data } = await api.post('/orders', {
            items,
            subtotal,
            shippingId,
            city,
            address,
            note,
            destination,
            deliveryDate,
            deliverySlot,
          })
          this.orders = replaceList(this.orders, data)
          this.persist()
          return data
        } catch (err) {
          throw new Error(apiError(err, 'ثبت سفارش انجام نشد.'))
        }
      }
      const shipping = useShippingStore().getShipping(shippingId)
      const order = {
        id: nextOrderId(this.orders),
        userId: user.id,
        customerName: user.name,
        title: user.title || 'آقا',
        company: user.company || '',
        phone: user.phone,
        city,
        address,
        destination,
        deliveryDate,
        deliverySlot,
        shipping,
        items,
        subtotal,
        shippingPrice: shipping.price,
        total: subtotal + shipping.price,
        status: ORDER_STATUS.AWAITING_RECEIPT,
        bank: shopBank,
        receiptUrl: '',
        receiptDataUrl: '',
        receiptName: '',
        receiptFingerprint: '',
        botResult: null,
        createdAt: new Date().toISOString(),
        note: note || '',
        adminNote: '',
      }
      this.orders.unshift(order)
      this.persist()
      return order
    },
    async applyReceipt(orderId, { dataUrl, name, declaredAmount, last4, botResult }) {
      const auth = useAuthStore()
      if (auth.online) {
        const { data } = await api.post(
          `/orders/${orderId}/receipt`,
          { dataUrl, name, declaredAmount, last4 },
          { timeout: 60000 },
        )
        this.orders = replaceList(this.orders, data)
        this.persist()
        return data
      }
      const order = this.orders.find((item) => item.id === orderId)
      if (!order) return
      order.receiptDataUrl = dataUrl
      order.receiptUrl = dataUrl
      order.receiptName = name
      order.receiptFingerprint = botResult?.fingerprint || ''
      order.botResult = botResult
      if (botResult?.decision === 'rejected') order.status = ORDER_STATUS.REJECTED
      else order.status = ORDER_STATUS.AWAITING_REVIEW
      this.persist()
      return order
    },
    async recheckReceipt(orderId) {
      const auth = useAuthStore()
      if (!auth.online) throw new Error('برای بررسی مجدد بات، API باید روشن باشد')
      const { data } = await api.post(`/orders/${orderId}/receipt/recheck`, {}, { timeout: 60000 })
      this.orders = replaceList(this.orders, data)
      this.persist()
      return data
    },
    async reviewOrder(orderId, { approved, adminNote }) {
      const auth = useAuthStore()
      if (auth.online) {
        const { data } = await api.post(`/orders/${orderId}/review`, { approved, adminNote })
        this.orders = replaceList(this.orders, data)
        this.persist()
        return data
      }
      const order = this.orders.find((item) => item.id === orderId)
      if (!order) return
      order.adminNote = adminNote || ''
      order.status = approved ? ORDER_STATUS.PREPARING : ORDER_STATUS.REJECTED
      this.persist()
      return order
    },
    async updateStatus(orderId, status) {
      const auth = useAuthStore()
      if (auth.online) {
        const { data } = await api.patch(`/orders/${orderId}/status`, { status })
        this.orders = replaceList(this.orders, data)
        this.persist()
        return data
      }
      const order = this.orders.find((item) => item.id === orderId)
      if (!order) return
      order.status = status
      this.persist()
      return order
    },
  },
})
