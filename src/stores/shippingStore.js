import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import {
  defaultShippingSettings,
  getShipping as baseGetShipping,
  normalizeTehranSlots,
  tehranSlots as defaultTehranSlots,
  withShippingSettings,
} from '@/data/shipping'

const STORAGE_KEY = 'imenmahdi-shipping'

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && typeof saved === 'object') {
      return {
        ...defaultShippingSettings,
        ...saved,
        tehranSlots: normalizeTehranSlots(saved.tehranSlots || defaultShippingSettings.tehranSlots),
      }
    }
  } catch {
    /* keep default */
  }
  return {
    ...defaultShippingSettings,
    tehranSlots: defaultTehranSlots.map((slot) => ({ ...slot })),
  }
}

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    settings: readSettings(),
  }),
  getters: {
    slots: (state) => normalizeTehranSlots(state.settings.tehranSlots),
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
    slotLabel() {
      return (id) => this.slots.find((item) => item.id === id)?.label || ''
    },
  },
  actions: {
    persist() {
      this.settings = {
        ...this.settings,
        tehranSlots: normalizeTehranSlots(this.settings.tehranSlots),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
      const auth = useAuthStore()
      if (auth.online && auth.isAdmin) api.put('/content/shipping', this.settings).catch(() => {})
    },
    async hydrate() {
      try {
        const { data } = await api.get('/content')
        if (data?.shipping && typeof data.shipping === 'object') {
          this.settings = {
            ...defaultShippingSettings,
            ...data.shipping,
            tehranSlots: normalizeTehranSlots(
              data.shipping.tehranSlots || defaultShippingSettings.tehranSlots,
            ),
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
        }
      } catch {
        /* keep local */
      }
    },
    update(payload) {
      this.settings = {
        ...this.settings,
        ...payload,
        tehranSlots: normalizeTehranSlots(
          payload.tehranSlots ?? this.settings.tehranSlots,
        ),
      }
      this.persist()
    },
    updateSlot(index, patch) {
      const next = this.slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))
      this.update({ tehranSlots: next })
    },
    addSlot() {
      const n = this.slots.length + 1
      this.update({
        tehranSlots: [...this.slots, { id: `slot-${Date.now()}`, label: `بازه ${n}` }],
      })
    },
    removeSlot(index) {
      if (this.slots.length <= 1) return
      this.update({ tehranSlots: this.slots.filter((_, i) => i !== index) })
    },
  },
})
