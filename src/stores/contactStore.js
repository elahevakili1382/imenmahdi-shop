import { defineStore } from 'pinia'

export const useContactStore = defineStore('contact', {
  state: () => ({
    open: false,
    productTitle: '',
    productSlug: '',
  }),
  actions: {
    openWidget(product) {
      this.productTitle = product?.title || ''
      this.productSlug = product?.slug || ''
      this.open = true
    },
    close() {
      this.open = false
    },
  },
})
