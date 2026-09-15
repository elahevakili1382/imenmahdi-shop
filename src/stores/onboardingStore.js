import { defineStore } from 'pinia'

const STORAGE_KEY = 'imenmahdi-onboarding'

const defaultState = {
  seenWelcome: false,
  learnedPayment: false,
  dismissed: false,
}

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    flags: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { ...defaultState },
  }),
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags))
    },
    mark(key) {
      this.flags[key] = true
      this.persist()
    },
    reset() {
      this.flags = { ...defaultState }
      this.persist()
    },
  },
})
