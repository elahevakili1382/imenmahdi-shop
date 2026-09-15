import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import {
  defaultShippingSettings,
  getShipping as baseGetShipping,
  tehranSlots,
  withShippingSettings,
} from '@/data/shipping'

const STORAGE_KEY = 'imenmahdi-shipping'

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && typeof saved === 'object') {
      return { ...defaultShippingSettings, ...saved }
    }
  } catch {
    /* keep default */
  }
  return { ...defaultShippingSettings }
}

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    settings: readSettings(),
  }),
  getters: {
    slots: () => tehranSlots,
    grouped: (state) => withShippingSettings(state.settings),
    methodsFor() {
      return (zone) => (zone === 'tehran' ? this.grouped.tehran : this.grouped.county)
    },
    getShipping() {
      return (id) => {
        const all = [...this.grouped.tehran, ...this.grouped.county]
        return all.find((item) => item.id === id) || baseGetShipping(id)
      }
    },
    slotLabel: () => (id) => tehranSlots.find((item) => item.id === id)?.label || '',
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
      const auth = useAuthStore()
      if (auth.online && auth.isAdmin) api.put('/content/shipping', this.settings).catch(() => {})
    },
    async hydrate() {
      try {
        const { data } = await api.get('/content')
        if (data?.shipping && typeof data.shipping === 'object') {
          this.settings = { ...defaultShippingSettings, ...data.shipping }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
        }
      } catch {
        /* keep local */
      }
    },
    update(payload) {
      this.settings = { ...this.settings, ...payload }
      this.persist()
    },
  },
})
